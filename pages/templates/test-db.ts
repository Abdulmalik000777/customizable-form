import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connection successful");

    // Test querying the Template table
    const templateCount = await prisma.template.count();
    console.log(`Number of templates: ${templateCount}`);

    res.status(200).json({
      message: "Database connection and query successful",
      templateCount,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}
