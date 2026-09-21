import type { Request, Response } from 'express';
import * as reportService from './report.services.js';
import logger from '../../lib/logger.js';

export async function createFilmReport(req: Request, res: Response) {
  try {
    logger.info("Incoming body:", req.body);
logger.info("Incoming file:", req.file?.originalname);
    const { auth_id, reportType, report, film_id } = req.body;

    const result = await reportService.submitFilmReport(auth_id, reportType, report, film_id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database error' });
  }
}

export async function createTechReport(req: Request, res: Response) {
  try {
    const { auth_id, reportType, report } = req.body;

    const result = await reportService.submitTechReport(auth_id, reportType, report);
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
 
