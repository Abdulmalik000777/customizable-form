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
      userId: user.id,
      questions: {
        create: [
          {
            title: "What is your name?",
            type: "short-text",
            required: true,
          },
          {
            title: "How was your experience?",
            type: "long-text",
            required: true,
          },
          {
            title: "How would you rate our service?",
            type: "number",
            required: true,
          },
          {
            title: "Would you recommend us to a friend?",
            type: "checkbox",
            required: true,
          },
          {
            title: "Which of our products did you use?",
            type: "multiple_choice",
            required: true,
          },
        ],
      },
    },
    include: {
      questions: true,
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
