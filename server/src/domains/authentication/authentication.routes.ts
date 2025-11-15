import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as authController from './authentication.controller.js';

const router = Router();

router.get('/status', requireAuth, authController.authStatus);
router.get('/me', requireAuth, authController.me);

export default router;
