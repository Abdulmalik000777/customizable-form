import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export function authMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    console.log("Authenticating request...");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      console.log("Decoded token:", decoded);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
}
