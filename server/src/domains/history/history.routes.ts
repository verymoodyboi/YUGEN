import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './history.controller.js';

const router = Router();

router.post('/add',  controller.addHistory);
router.get('/',  controller.getHistory);
router.delete('/',  controller.getHistory);
export default router;
