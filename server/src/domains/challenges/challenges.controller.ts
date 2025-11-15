import type { Request, Response } from "express";
import * as service from "./challenges.services.js";
import {
  createChallengeSchema,
  editChallengeSchema,
  savePodiumSchema,
  listQuerySchema,
} from "./challenges.validations.js";
import type { CreateChallengeDTO, EditChallengeDTO } from "./challenges.types.js";

type AuthRequest = Request & { user?: { id?: string; [k: string]: any } };

export async function listAdminChallenges(req: Request, res: Response) {
  try {
    const { error } = listQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });

    const offset = parseInt(String(req.query.offset ?? "0"), 10);
    const limit = parseInt(String(req.query.limit ?? "5"), 10);

    const data = await service.listChallenges("admin", offset, limit);
    res.json(data);
  } catch (err: any) {
    console.error("List admin challenges error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function listCommunityChallenges(req: Request, res: Response) {
  try {
    const offset = parseInt(String(req.query.offset ?? "0"), 10);
    const limit = parseInt(String(req.query.limit ?? "5"), 10);
    const data = await service.listChallenges("user", offset, limit);
    res.json(data);
  } catch (err: any) {
    console.error("List community challenges error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function listAcademicChallenges(req: Request, res: Response) {
  try {
    const offset = parseInt(String(req.query.offset ?? "0"), 10);
    const limit = parseInt(String(req.query.limit ?? "5"), 10);
    const data = await service.listChallenges("academic", offset, limit);
    res.json(data);
  } catch (err: any) {
    console.error("List academic challenges error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function listUserChallenges(req: Request, res: Response) {
  try {
    const { offset = "0", limit = "5", auth_id } = req.query;
    const data = await service.listUserChallenges(parseInt(String(offset), 10), parseInt(String(limit), 10), auth_id as string);
    res.json(data);
  } catch (err: any) {
    console.error("List user challenges error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// ---------- DETAILS ----------
export async function getChallenge(req: AuthRequest, res: Response) {
  try {
    const challenge = await service.getChallenge(String(req.params.id));
    res.json({ challenge });
  } catch (err: any) {
    console.error("Get challenge error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function getChallengeFilms(req: AuthRequest, res: Response) {
  try {
    const films = await service.getChallengeFilms(String(req.params.id));
    res.json({ films });
  } catch (err: any) {
    console.error("Get challenge films error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function getSubmission(req: AuthRequest, res: Response) {
  try {
    const submission = await service.getSubmission(String(req.params.id), String(req.user?.id));
    res.json({ submission });
  } catch (err: any) {
    console.error("Get submission error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function getMyFilms(req: AuthRequest, res: Response) {
  try {
    const films = await service.getMyFilms(String(req.user?.id));
    res.json({ films });
  } catch (err: any) {
    console.error("Get my films error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// ---------- SUBMISSION ----------
export async function submitFilm(req: AuthRequest, res: Response) {
  try {
    const challengeId = String(req.params.id);
    const film_uuid = String(req.body.film_uuid);
    if (!film_uuid) return res.status(400).json({ error: "Missing film_uuid" });

    const submission = await service.submitFilm(challengeId, String(req.user?.id), film_uuid);
    res.json({ submission });
  } catch (err: any) {
    console.error("Submit film error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function removeSubmission(req: AuthRequest, res: Response) {
  try {
    const challengeId = String(req.params.id);
    const film_uuid = String(req.body.film_uuid);
    if (!film_uuid) return res.status(400).json({ error: "Missing film_uuid" });

    await service.removeSubmission(challengeId, String(req.user?.id), film_uuid);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Remove submission error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// ---------- VOTING ----------
export async function getVote(req: AuthRequest, res: Response) {
  try {
    const vote = await service.getVote(String(req.params.id), String(req.user?.id));
    res.json({ vote });
  } catch (err: any) {
    console.error("Get vote error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function toggleVote(req: AuthRequest, res: Response) {
  try {
    const film_uuid = String(req.body.film_uuid);
    if (!film_uuid) return res.status(400).json({ error: "Missing film_uuid" });

    const result = await service.toggleVote(String(req.params.id), String(req.user?.id), film_uuid);
    res.json(result);
  } catch (err: any) {
    console.error("Toggle vote error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// ---------- CREATION + MGMT ----------
export async function createChallenge(req: AuthRequest, res: Response) {
  try {
    const { error } = createChallengeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });

    const dto = req.body as CreateChallengeDTO;
    const challenge = await service.createChallenge(String(req.user?.id), dto, req.file as Express.Multer.File | undefined);
    res.json({ challenge });
  } catch (err: any) {
    console.error("Create challenge error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function getPendingFilms(req: AuthRequest, res: Response) {
  try {
    const films = await service.getPendingFilms(String(req.params.id));
    res.json({ films });
  } catch (err: any) {
    console.error("Get pending films error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function acceptFilm(req: AuthRequest, res: Response) {
  try {
    await service.acceptFilm(String(req.params.id), String(req.params.filmUuid));
    res.json({ message: "Film accepted successfully" });
  } catch (err: any) {
    console.error("Accept film error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function removeFilm(req: AuthRequest, res: Response) {
  try {
    await service.removeFilm(String(req.params.id), String(req.params.filmUuid));
    res.json({ message: "Film removed successfully" });
  } catch (err: any) {
    console.error("Remove film error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function editChallenge(req: AuthRequest, res: Response) {
  try {
    const { error } = editChallengeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });

    const body = req.body as EditChallengeDTO;
    await service.editChallenge(String(req.params.id), body);
    res.json({ message: "Challenge updated successfully" });
  } catch (err: any) {
    console.error("Edit challenge error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// ---------- PODIUM ----------
export async function getPodium(req: AuthRequest, res: Response) {
  try {
    const podium = await service.getPodium(String(req.params.id));
    res.json({ podium });
  } catch (err: any) {
    console.error("Get podium error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function savePodium(req: AuthRequest, res: Response) {
  try {
    const { error } = savePodiumSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });

    const podium = req.body.podium;
    const saved = await service.savePodium(String(req.params.id), podium);
    res.json({ podium: saved });
  } catch (err: any) {
    console.error("Save podium error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}
