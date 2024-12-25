import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Invalid search query" });
    }

    try {
      const results = await prisma.template.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
        },
      });

      res.status(200).json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "An error occurred while searching" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
