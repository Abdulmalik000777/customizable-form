import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res
      .status(200)
      .json({ message: "Database connection successful", userCount });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      error: "Database connection failed",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await prisma.$disconnect();
  }
}
