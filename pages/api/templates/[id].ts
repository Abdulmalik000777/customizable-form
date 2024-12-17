import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const template = await prisma.template.findUnique({
        where: { id: String(id) },
        include: { questions: true },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.status(200).json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Error fetching template" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
