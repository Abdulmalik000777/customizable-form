import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const templates = await prisma.template.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Error fetching templates" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
