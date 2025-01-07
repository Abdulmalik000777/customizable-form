import jwt from "jsonwebtoken";
import prisma from "./prisma";

export async function refreshToken(oldToken: string): Promise<string | null> {
  try {
    const decoded = jwt.decode(oldToken) as {
      userId: string;
      email: string;
    } | null;
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return newToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
