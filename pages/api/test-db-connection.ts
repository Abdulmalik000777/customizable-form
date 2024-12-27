import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Attempt to fetch all users from the database
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // If successful, return the users
      res
        .status(200)
        .json({ message: "Database connection successful", users });
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({
        error: "Failed to connect to the database",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
