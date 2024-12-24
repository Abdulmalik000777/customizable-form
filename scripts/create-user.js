require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function createUser(name, email, password) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log(
        "User with this email already exists. Please use a different email or try logging in."
      );
      return;
    }

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
