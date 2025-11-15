import type { Request, Response } from "express";
import * as service from "./tools.services.js";
import { checkEmailSchema, checkUsernameSchema } from "./tools.validations.js";

export async function checkEmail(req: Request, res: Response) {
  try {
    const { error } = checkEmailSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const { email } = req.query as { email: string };
    const result = await service.checkEmail(email);

    if (!result.available) {
      return res.status(409).json({ error: "Email already in use" });
    }

    res.json({ message: "Email available" });
  } catch (err: any) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function checkUsername(req: Request, res: Response) {
  try {
    const { error } = checkUsernameSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const { username } = req.query as { username: string };
    const result = await service.checkUsername(username);

    if (!result.available) {
      return res.status(409).json({ error: "Username already taken", username: result.username });
    }

    res.json({ message: "Username available" });
  } catch (err: any) {
    console.error("Error checking username:", err);
    res.status(500).json({ error: "Server error" });
  }
}

