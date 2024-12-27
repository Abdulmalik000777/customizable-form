import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    if (
      !authHeader ||
      (typeof authHeader === "string" && !authHeader.startsWith("Bearer "))
    ) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      reject(new Error("Unauthorized: No token provided"));
      return;
    }

    const token =
      typeof authHeader === "string"
        ? authHeader.split(" ")[1]
        : authHeader[0].split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      req.user = decoded;
      resolve();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      reject(new Error("Unauthorized: Invalid token"));
    }
  });
}
