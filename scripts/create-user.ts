import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createUser(name: string, email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    console.log("User created successfully:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
const userName = process.argv[2];
const userEmail = process.argv[3];
const userPassword = process.argv[4];

if (!userName || !userEmail || !userPassword) {
  console.error(
    "Please provide name, email, and password as command-line arguments"
  );
  process.exit(1);
}

createUser(userName, userEmail, userPassword);
