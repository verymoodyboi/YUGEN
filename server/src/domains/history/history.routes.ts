import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './history.controller.js';

const router = Router();

router.post('/add',requireAuth,  controller.addHistory);
router.get('/',requireAuth,  controller.getHistory);
router.delete('/',requireAuth,  controller.getHistory);
export default router;
