import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

const prisma = new PrismaClient();

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

async function deleteAssociatedData(templateId: string) {
  let deletedSubmissions = 0;
  let deletedQuestions = 0;
  let hasMore = true;
  let retries = 0;

  while (hasMore && retries < MAX_RETRIES) {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete submissions first
        const submissions = await tx.submission.findMany({
          where: { templateId },
          take: BATCH_SIZE,
          select: { id: true },
        });

        if (submissions.length > 0) {
          await tx.submission.deleteMany({
            where: { id: { in: submissions.map((s) => s.id) } },
          });
          deletedSubmissions += submissions.length;
        }

        // Then delete questions
        const questions = await tx.question.findMany({
          where: { templateId },
          take: BATCH_SIZE,
          select: { id: true },
        });

        if (questions.length > 0) {
          await tx.question.deleteMany({
            where: { id: { in: questions.map((q) => q.id) } },
          });
          deletedQuestions += questions.length;
        }

        hasMore =
          submissions.length === BATCH_SIZE || questions.length === BATCH_SIZE;
      });

      console.log(
        `Deleted ${deletedSubmissions} submissions and ${deletedQuestions} questions`
      );
      retries = 0; // Reset retries on successful operation
    } catch (error) {
      console.error("Error in deleteAssociatedData:", error);
      retries++;
      if (retries >= MAX_RETRIES) {
        throw new Error("Max retries reached in deleteAssociatedData");
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }

  return { deletedSubmissions, deletedQuestions };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      console.log("Deleting template with id:", id);
      console.log("User:", req.user);

      const template = await prisma.template.findFirst({
        where: { id: String(id), userId: req.user!.userId },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Delete associated data
      const { deletedSubmissions, deletedQuestions } =
        await deleteAssociatedData(String(id));

      // Delete the template
      await prisma.template.delete({
        where: { id: String(id) },
      });

      console.log("Template and associated data deleted successfully");
      res.status(200).json({
        message: "Template deleted successfully",
        deletedSubmissions,
        deletedQuestions,
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({
        error: "Error deleting template",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    // Keep existing GET and PUT methods...
    if (req.method === "GET") {
      try {
        console.log("Fetching template with id:", id);
        console.log("User:", req.user);
        const template = await prisma.template.findFirst({
          where: { id: String(id), userId: req.user!.userId },
          include: { questions: true },
        });

        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }

        res.status(200).json(template);
      } catch (error) {
        console.error("Error fetching template:", error);
        res.status(500).json({
          error: "Error fetching template",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    } else if (req.method === "PUT") {
      try {
        console.log("Updating template with id:", id);
        console.log("User:", req.user);
        console.log("Request body:", req.body);

        const { title, description, questions } = req.body;

        const template = await prisma.template.findFirst({
          where: { id: String(id), userId: req.user!.userId },
        });

        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }

        // Update template
        const updatedTemplate = await prisma.template.update({
          where: { id: String(id) },
          data: {
            title,
            description,
            questions: {
              deleteMany: {},
              create: questions.map((q: any) => ({
                type: q.type,
                title: q.title,
                description: q.description,
                required: q.required,
              })),
            },
          },
          include: { questions: true },
        });

        res.status(200).json(updatedTemplate);
      } catch (error) {
        console.error("Error updating template:", error);
        res.status(500).json({
          error: "Error updating template",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
}

export default function (req: AuthenticatedRequest, res: NextApiResponse) {
  return authMiddleware(req, res).then(() => handler(req, res));
}
