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

      // Fetch the template to check ownership
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        include: { questions: true },
      });

      if (!template || template.userId !== req.user!.userId) {
        return res
          .status(403)
          .json({ error: "Not authorized to view this template" });
      }

      // Fetch and aggregate submission data
      const submissions = await prisma.submission.findMany({
        where: { templateId },
        include: { answers: true },
      });

      const questionData = template.questions.map((question) => {
        const answers = submissions.flatMap((sub) =>
          sub.answers.filter((ans) => ans.questionId === question.id)
        );

        let data;
        if (question.type === "number") {
          const numericAnswers = answers
            .map((a) => parseFloat(a.value))
            .filter((n) => !isNaN(n));
          data = {
            average:
              numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length,
            min: Math.min(...numericAnswers),
            max: Math.max(...numericAnswers),
          };
        } else {
          const answerCounts = answers.reduce((acc, ans) => {
            acc[ans.value] = (acc[ans.value] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          data = Object.entries(answerCounts).map(([value, count]) => ({
            value,
            count,
          }));
        }

        return {
          questionId: question.id,
          title: question.title,
          type: question.type,
          data,
        };
      });

      res.status(200).json({
        totalSubmissions: submissions.length,
        questionData,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Error fetching analytics" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default function (req: AuthenticatedRequest, res: NextApiResponse) {
  return authMiddleware(req, res).then(() => handler(req, res));
}
