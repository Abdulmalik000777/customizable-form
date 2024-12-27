import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Attempt to fetch all users from the database
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // If successful, return the users
      res
        .status(200)
        .json({ message: "Supabase connection successful", users });
    } catch (error) {
      console.error("Supabase connection error:", error);
      res.status(500).json({
        error: "Failed to connect to Supabase",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
