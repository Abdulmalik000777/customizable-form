import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Test user registration
      const newUser = await prisma.user.create({
        data: {
          name: "Test User",
          email: "testuser@example.com",
          password: "hashedpassword123", // In a real scenario, this should be hashed
        },
      });

      // Test template creation
      const newTemplate = await prisma.template.create({
        data: {
          title: "Test Template",
          description: "This is a test template",
          userId: newUser.id,
          questions: {
            create: [
              {
                type: "short-text",
                title: "Test Question",
                description: "This is a test question",
                required: true,
              },
            ],
          },
        },
      });

      res.status(200).json({
        message: "Test routes executed successfully",
        user: newUser,
        template: newTemplate,
      });
    } catch (error) {
      console.error("Error in test routes:", error);
      res.status(500).json({ error: "An error occurred while testing routes" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
