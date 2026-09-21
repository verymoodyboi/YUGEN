import type { Request, Response } from 'express';
import * as service from './profile.services.js';
import { socialsSchema, editProfileSchema,preRegisterSocialsSchema, schoolSchema, contactInfoSchema } from './profile.validations.js';

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
    if (error) {
      return res.status(400).json({
        error: error.details.map((d) => d.message),
      });
    }

    const authId = req.user?.id;
    if (!authId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
console.log("REQ BODY EDIT PROFILE:", req.body);

    const result = await service.editProfile(authId, req.body);

    res.json({
      message: "Profile updated successfully!",
      uploadUrl: result.uploadUrl ?? null,
    });
  } catch (err: any) {
    console.error("Error editing profile:", err);
    res.status(500).json({ error: err.message });
  }
}


export async function compressPfp(req: Request, res: Response) {
  try {
    
    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: 'Unauthorized' });
    await service.compressPfp(authId);
    res.json({ message: 'pfp qeued!' });
  } catch (err: any) {
    console.error('Error pfp qeued:', err);
    res.status(500).json({ error: err.message });
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



export async function addSchool(req: Request, res: Response) {
  try {
    const { error } = schoolSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });

    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: "Unauthorized" });

    await service.addSchool(authId, req.body.school);

    res.json({ message: "School added successfully!" });
  } catch (err: any) {
    console.error("Error adding school:", err);
    res.status(500).json({ error: err.message });
  }
}


export async function getContactInfo(req: Request, res: Response) {
  try {
    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: "Unauthorized" });

    const data = await service.getContactInfo(authId);

    res.json(data);
  } catch (err: any) {
    console.error("Error fetching contact info:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateContactInfo(req: Request, res: Response) {
  try {
    const { error } = contactInfoSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });

    const authId = req.user?.id;
    if (!authId) return res.status(401).json({ error: "Unauthorized" });

    await service.updateContactInfo(authId, req.body);

    res.json({ message: "Contact info updated successfully!" });
  } catch (err: any) {
    console.error("Error updating contact info:", err);
    res.status(500).json({ error: err.message });
  }
}