import type { Request, Response } from 'express';
import * as reportService from './support_tickets.services';
import logger from '../../../lib/logger';



export async function createTechReport(req: Request, res: Response) {
  try {
    const { auth_id, reportType, report } = req.body;

    const result = await reportService.submitTechReport(auth_id, reportType, report);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database error' });
  }
}

export async function listTechReports(req: Request, res: Response) {
  try {
    const result = await reportService.getAllTechReports();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database error' });
  }
}

export async function replyToTechReportController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const result = await reportService.replyToTechReport(id, message);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database error' });
  }
}



export async function submitAccountReportController(req: Request, res: Response): Promise<void> {
  try {
    const {reported_by, reported, reason, report } = req.body;
   // const reported_by = (req as any).user?.auth_id;
 
    if (!reported_by) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
 
    if (!reported) {
      res.status(400).json({ error: "reported (user id) is required" });
      return;
    }
 
    if (!reason) {
      res.status(400).json({ error: "reason is required" });
      return;
    }
 
    const result = await reportService.reportAccount({ reported, reported_by, reason, report });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}