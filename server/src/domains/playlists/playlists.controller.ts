import type { Request, Response } from 'express';
import * as service from './playlists.services.js';
import {
  createPlaylistSchema,
  addToPlaylistSchema,
  checkListedSchema,
  togglePublicSchema,
} from './playlists.validations.js';

export async function getUserPlaylists(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const playlists = await service.getUserPlaylists(userId);
    res.json({ playlists });
  } catch (err: any) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getPlaylistFilms(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const films = await service.getPlaylistFilms(id);
    res.json({ films });
  } catch (err: any) {
    console.error('Fetch playlist films error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getPlaylistMeta(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const playlist = await service.getPlaylistMeta(id);
    res.json({ playlist });
  } catch (err: any) {
    console.error('Fetch playlist meta error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getMyPlaylists(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const playlists = await service.getMyPlaylists(userId!);
    res.json({ playlists });
  } catch (err: any) {
    console.error('Fetch my playlists error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function createPlaylist(req: Request, res: Response) {
  try {
    const { error } = createPlaylistSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    await service.createPlaylist(userId!, req.body.playlist_name, req.body.is_public);
    res.json({ success: true, message: 'Playlist created' });
  } catch (err: any) {
    console.error('Create playlist error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function addOrRemoveFilm(req: Request, res: Response) {
  try {
    const { error } = addToPlaylistSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const result = await service.addOrRemoveFilm(userId!, req.body.playlistID, req.body.filmID);
    res.json(result);
  } catch (err: any) {
    console.error('Add-to-playlist error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function checkListed(req: Request, res: Response) {
  try {
    const { error } = checkListedSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const listed = await service.checkListed(userId!, req.query.playlistID as string, req.query.filmID as string);
    res.json({ listed });
  } catch (err: any) {
    console.error('Check-listed error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function togglePublic(req: Request, res: Response) {
  try {
    const { error } = togglePublicSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const userId = req.user?.id;
    const result = await service.togglePublic(userId!, req.body.playlist_uuid);
    res.json(result);
  } catch (err: any) {
    console.error('Public toggle error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function checkPublic(req: Request, res: Response) {
  try {
    const playlist_uuid = req.query.playlist_uuid as string;
    const result = await service.checkPublic(playlist_uuid);
    res.json(result);
  } catch (err: any) {
    console.error('Check public error:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function deletePlaylists(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const playlists = await service.deletePlaylists(userId);
    res.json({ playlists });
  } catch (err: any) {
    console.error('Error deleting playlists:', err);
    res.status(500).json({ error: err.message });
  }
}