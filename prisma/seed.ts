import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash("testpassword123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "testuser@example.com",
      password: hashedPassword,
    },
  });

  // Create a test template
  const template = await prisma.template.create({
    data: {
      title: "Customer Feedback Form",
      description: "A form to collect customer feedback",
      userId: user.id,
      questions: {
        create: [
          {
            type: "short-text",
            title: "What is your name?",
            description: "Please enter your full name",
            required: true,
          },
          {
            type: "long-text",
            title: "How was your experience?",
            description: "Please describe your experience with our service",
            required: true,
          },
          {
            type: "number",
            title: "How would you rate our service?",
            description: "On a scale of 1-10, with 10 being the best",
            required: true,
            minValue: 1,
            maxValue: 10,
          },
        ],
      },
    },
  });

  console.log({ user, template });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
