import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './subscriptions.controller.js';

const router = Router();

router.get('/check', requireAuth, controller.checkSubscription);
router.post('/', requireAuth, controller.subscribe);
router.delete('/', requireAuth, controller.unsubscribe);
router.put('/notify', requireAuth, controller.updateNotify);
router.get('/my', requireAuth, controller.mySubscriptions);
router.get('/notifications', requireAuth, controller.getNotifications);

export default router;
