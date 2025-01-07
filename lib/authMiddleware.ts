import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { refreshToken } from "./auth";

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
  return new Promise(async (resolve, reject) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Unauthorized: No token provided");
      res.status(401).json({ message: "Unauthorized: No token provided" });
      reject(new Error("Unauthorized: No token provided"));
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
      req.user = decoded;
      console.log("User authenticated:", decoded);
      resolve();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log("Token expired, attempting to refresh");
        try {
          const newToken = await refreshToken(token);
          if (newToken) {
            const decoded = jwt.verify(newToken, process.env.JWT_SECRET!) as {
              userId: string;
              email: string;
            };
            req.user = decoded;
            res.setHeader("X-New-Token", newToken);
            console.log("Token refreshed successfully");
            resolve();
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          res.status(401).json({
            message: "Unauthorized: Token expired and refresh failed",
          });
          reject(new Error("Unauthorized: Token expired and refresh failed"));
        }
      } else {
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        reject(new Error("Unauthorized: Invalid token"));
      }
    }
  });
}
