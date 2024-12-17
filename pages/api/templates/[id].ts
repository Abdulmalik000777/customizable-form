import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
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
      res.status(500).json({ error: "Error fetching template" });
    }
  } else if (req.method === "PUT") {
    try {
      const { title, description, questions } = req.body;

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

      if (updatedTemplate.userId !== req.user!.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this template" });
      }

      res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Error updating template" });
    }
  } else if (req.method === "DELETE") {
    try {
      const template = await prisma.template.findFirst({
        where: { id: String(id), userId: req.user!.userId },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      await prisma.template.delete({
        where: { id: String(id) },
      });

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Error deleting template" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
