import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './pokes.controller.js';

const router = Router();

router.post('/poke', requireAuth, controller.sendPoke);
router.put('/accept-poke', requireAuth, controller.acceptPoke);
router.get('/user-pokes', requireAuth, controller.getUserPokes);

router.delete("/delete", requireAuth, controller.deletePoke);
router.get("/status", requireAuth, controller.getPokeStatus);

router.delete("/reject/:pokeId", requireAuth, controller.rejectPoke);
export default router;