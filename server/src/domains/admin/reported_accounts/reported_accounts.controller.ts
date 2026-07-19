import { Request, Response } from "express";
import {
  getReportedAccounts,
  dismissReport,
  banUser,
} from "./reported_accounts.services.js";

export async function getAllReportedAccountsController(req: Request, res: Response): Promise<void> {
  try {
    const accounts = await getReportedAccounts();
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function dismissReportController(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "id parameter is required" });
      return;
    }

    const result = await dismissReport(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function banUserController(req: Request, res: Response): Promise<void> {
  try {
    const { auth_id } = req.params;
    if (!auth_id) {
      res.status(400).json({ error: "auth_id parameter is required" });
      return;
    }

    const result = await banUser(auth_id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
