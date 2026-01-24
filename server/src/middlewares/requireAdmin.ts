import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";
import supabase from "../lib/supabase.js";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error) {
      logger.error("Admin check error:", error);
      res.status(500).json({ error: "Admin check failed" });
      return;
    }

    if (!data?.is_admin) {
      res.status(403).json({ error: "Admin access only" });
      return;
    }

    next();
  } catch (err) {
    logger.error("RequireAdmin error:", err);
    res.status(500).json({ error: "Admin authorization failed" });
  }
}
