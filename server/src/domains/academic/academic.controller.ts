import type { Request, Response } from 'express';
import * as service from './academic.services.js';
import { academicApplicationSchema, queryUsernameSchema } from './academic.validations.js';

export async function registerAcademic(req: Request, res: Response) {
  try {
    const { error } = academicApplicationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });

    const { email, university, role, username, uniID } = req.body;
    const file = req.file;

    const application = await service.createApplication(username, email, role, university, uniID, file);

    res.json({ application });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAcademicApplication(req: Request, res: Response) {
  try {
    const { error } = queryUsernameSchema.validate(req.query);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });

    const { username } = req.query as { username: string };

    const application = await service.getApplication(username);
    res.json({ application });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAcademicApplication(req: Request, res: Response) {
  try {
    const { error } = queryUsernameSchema.validate(req.query);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details.map(d => d.message) });

    const { username } = req.query as { username: string };
    const auth_id = req.user?.id;

    await service.deleteApplication(username, auth_id);
    res.json({ message: 'Application removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
