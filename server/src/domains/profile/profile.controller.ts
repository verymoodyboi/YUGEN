import type { Request, Response } from 'express';
import * as service from './profile.services.js';
import { socialsSchema, editProfileSchema,preRegisterSocialsSchema } from './profile.validations.js';

export async function updateSocials(req: Request, res: Response) {
  try {
    const { error } = socialsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: 'Unauthorized' });

    await service.updateSocials(authId, req.body);
    res.json({ message: 'Socials updated successfully!' });
  } catch (err: any) {
    console.error('Error updating socials:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function addUserType(req: Request, res: Response) {
  try {
    
    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: 'Unauthorized' });
const {userType}=req.body
    await service.addUserType(userType, authId);
    res.json({ message: 'user type updated successfully!' });
  } catch (err: any) {
    console.error('Error updating user type:', err);
    res.status(500).json({ error: err.message });
  }
}


export async function editProfile(req: Request, res: Response) {
  try {
    const { error } = editProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: 'Unauthorized' });

    await service.editProfile(authId, req.body, req.file);
    res.json({ message: 'Profile updated successfully!' });
  } catch (err: any) {
    console.error('Error editing profile:', err);
    res.status(500).json({ error: err.message });
    console.log("BODY:", req.body);
console.log("FILE:", req.file?.originalname);
  }
}

export async function preRegisterSocials(req: Request, res: Response) {
  const { error } = preRegisterSocialsSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    const result = await service.preRegisterSocials(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in preRegisterSocials:', err);
    res.status(500).json({ error: err.message });
  }
}


