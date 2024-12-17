import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { title, description, questions } = req.body;

      const template = await prisma.template.create({
        data: {
          title,
          description,
          userId: req.user!.userId,
          questions: {
            create: questions.map((q: any) => ({
              type: q.type,
              title: q.title,
              description: q.description,
              required: q.required,
            })),
          },
        },
        include: {
          questions: true,
        },
      });

      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Error creating template" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);
