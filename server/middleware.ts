import { Request, Response, NextFunction } from "express";
import { auth } from "./auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    timezone?: string | null;
    isOnboarded?: string | null;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (session) {
      req.user = session.user;
      req.session = session.session;
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
