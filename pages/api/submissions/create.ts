import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

interface Question {
  id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
  minLength?: number | null;
  maxLength?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  regex?: string | null;
}

interface Template {
  id: string;
  questions: Question[];
}

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { templateId, answers } = req.body;

      // Validate input
      if (!templateId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Check if the template exists
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: { questions: true },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Validate answers against template questions
      if (answers.length !== template.questions.length) {
        return res.status(400).json({ error: "Invalid number of answers" });
      }

      // Create submission
      const submission = await prisma.submission.create({
        data: {
          templateId: template.id,
          userId: req.user!.userId,
          answers: {
            create: answers.map((answer, index) => ({
              questionId: template.questions[index].id,
              value: answer,
            })),
          },
        },
        include: {
          answers: true,
        },
      });

      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ error: "Error creating submission" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
