import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../lib/authMiddleware";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  console.log("Handler function called");
  console.log("Request method:", req.method);
  console.log("User:", req.user);
  console.log("Fetching templates...");
  console.log("User:", req.user);
  if (req.method === "GET") {
    try {
      const templates = await prisma.template.findMany({
        where: { userId: req.user!.userId },
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
      console.log("Templates fetched:", templates);
      res.status(200).json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      console.error("Detailed error:", error);
      res.status(500).json({
        error: "Error fetching templates",
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

export default authMiddleware(handler);
