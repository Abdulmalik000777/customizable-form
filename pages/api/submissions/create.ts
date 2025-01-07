import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { templateId, answers } = req.body;

    if (!templateId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Validate user authentication
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if template exists and belongs to user
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
      },
      include: {
        questions: true,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Create submission with error handling
    try {
      const submission = await prisma.submission.create({
        data: {
          templateId,
          userId: req.user.userId,
          answers: {
            create: answers.map((answer: any) => ({
              questionId: answer.questionId,
              value: answer.value,
            })),
          },
        },
        include: {
          answers: true,
        },
      });

      return res.status(201).json(submission);
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create submission" });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}

export default function (req: AuthenticatedRequest, res: NextApiResponse) {
  return authMiddleware(req, res).then(() => handler(req, res));
}
