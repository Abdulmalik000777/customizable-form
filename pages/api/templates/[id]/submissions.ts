import { NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import {
  authMiddleware,
  AuthenticatedRequest,
} from "../../../../lib/authMiddleware";

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      const templateId = String(id);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const sortBy = String(req.query.sortBy) || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
      const filterQuestion = String(req.query.filterQuestion) || "";
      const filterValue = String(req.query.filterValue) || "";

      // Fetch the template to check ownership
      const template = await prisma.template.findUnique({
        where: { id: templateId },
      });

      if (!template || template.userId !== req.user!.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to view these submissions" });
      }

      // Prepare filter condition
      const filterCondition =
        filterQuestion && filterValue
          ? {
              answers: {
                some: {
                  question: { title: filterQuestion },
                  value: { contains: filterValue, mode: "insensitive" },
                },
              },
            }
          : {};

      // Fetch submissions with pagination, sorting, and filtering
      const submissions = await prisma.submission.findMany({
        where: {
          templateId,
          ...filterCondition,
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Get total count of submissions
      const totalSubmissions = await prisma.submission.count({
        where: {
          templateId,
          ...filterCondition,
        },
      });

      res.status(200).json({
        submissions,
        totalPages: Math.ceil(totalSubmissions / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Error fetching submissions" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default authMiddleware(handler);