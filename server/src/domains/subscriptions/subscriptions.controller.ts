import type { Request, Response } from 'express';
import * as service from './subscriptions.services.js';
import {
  checkSubscriptionSchema,
  subscribeSchema,
  unsubscribeSchema,
  updateNotifySchema,
} from './subscriptions.validations.js';

export async function checkSubscription(req: Request, res: Response) {
  try {
    const { error } = checkSubscriptionSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const subscriberId = req.user?.id;
    const { artistId } = req.query;

    if (!subscriberId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await service.checkSubscription(subscriberId, String(artistId));
    res.json(result);
  } catch (err: any) {
    console.error('Error checking subscription:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function subscribe(req: Request, res: Response) {
  try {
    const { error } = subscribeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const subscriberId = req.user?.id;
    const { artistId } = req.body;

    if (!subscriberId) return res.status(401).json({ error: 'Unauthorized' });

    await service.subscribe(subscriberId, artistId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error subscribing:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function unsubscribe(req: Request, res: Response) {
  try {
    const { error } = unsubscribeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const subscriberId = req.user?.id;
    const { artistId } = req.body;

    if (!subscriberId) return res.status(401).json({ error: 'Unauthorized' });

    await service.unsubscribe(subscriberId, artistId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error unsubscribing:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateNotify(req: Request, res: Response) {
  try {
    const { error } = updateNotifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const subscriberId = req.user?.id;
    const { artistId, notify } = req.body;

    if (!subscriberId) return res.status(401).json({ error: 'Unauthorized' });

    await service.updateNotify(subscriberId, artistId, notify);
    res.json({ success: true, notify });
  } catch (err: any) {
    console.error('Error updating notify:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function mySubscriptions(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const subscriptions = await service.mySubscriptions(userId);
    res.json({ subscriptions });
  } catch (err: any) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const films = await service.getNotifications(userId);
    res.json({ films });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}