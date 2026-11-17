import type { Request, Response } from 'express';
import * as service from './thoughts.services.js';
import { addThoughtSchema, deleteThoughtSchema, voteSchema, replySchema, replyVoteSchema } from './thoughts.validations.js';
export async function flagThought(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { thoughtId, reason } = req.body;
    if (!thoughtId || !reason) return res.status(400).json({ error: "Missing fields" });
if (!userId || !thoughtId) {
  return res.status(400).json({ error: "Missing parameters" });
}
    const result = await service.flagThought(userId, thoughtId, reason);
    return res.json(result);
  } catch (err: any) {
    console.error("flagThought error:", err);
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Already flagged" });
    }
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}

export async function flagReply(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { replyId, reason } = req.body;
    if (!replyId || !reason) return res.status(400).json({ error: "Missing fields" });
if (!userId ) {
  return res.status(400).json({ error: "Missing parameters" });
}
    const result = await service.flagReply(userId, replyId, reason);
    return res.json(result);
  } catch (err: any) {
    console.error("flagReply error:", err);
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Already flagged" });
    }
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
export async function getThoughts(req: Request, res: Response) {
  try {
    const { filmId } = req.params;
    const userId = req.user?.id!;
    const result = await service.getThoughts(filmId, userId);
    res.json(result);
  } catch (err: any) {
    console.error('Fetch thoughts error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function addThought(req: Request, res: Response) {
  const { error } = addThoughtSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    await service.addThought(req.user?.id!, req.body);
    res.json({ message: 'Thought submitted successfully!' });
  } catch (err: any) {
    console.error('Add thought error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteThought(req: Request, res: Response) {
  const { error } = deleteThoughtSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    await service.deleteThought(req.user?.id!, req.body.id);
    res.json({ message: 'Thought deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function upvote(req: Request, res: Response) {
  const { error } = voteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    const result = await service.voteThought(req.user?.id!, req.body.thoughtId, 'up');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function downvote(req: Request, res: Response) {
  const { error } = voteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    const result = await service.voteThought(req.user?.id!, req.body.thoughtId, 'down');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addReply(req: Request, res: Response) {
  const { error } = replySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    await service.addReply(req.user?.id!, req.body);
    res.json({ success: true, message: 'Reply added' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function upvoteReply(req: Request, res: Response) {
  const { error } = replyVoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    const result = await service.voteReply(req.user?.id!, req.body.replyId, 'up');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function downvoteReply(req: Request, res: Response) {
  const { error } = replyVoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    const result = await service.voteReply(req.user?.id!, req.body.replyId, 'down');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteReply(req: Request, res: Response) {
  const { error } = replyVoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

  try {
    await service.deleteReply(req.user?.id!, req.body.replyId);
    res.json({ success: true, message: 'Reply deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
