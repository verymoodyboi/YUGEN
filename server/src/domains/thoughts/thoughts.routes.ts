import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './thoughts.controller.js';

const router = Router();

router.get('/:filmId', controller.getThoughts);
router.post('/add', requireAuth, controller.addThought);
router.post('/delete', requireAuth, controller.deleteThought);
router.post('/upvote', requireAuth, controller.upvote);
router.post('/downvote', requireAuth, controller.downvote);

router.post('/replies/add', requireAuth, controller.addReply);
router.post('/replies/upvote', requireAuth, controller.upvoteReply);
router.post('/replies/downvote', requireAuth, controller.downvoteReply);
router.post('/replies/delete', requireAuth, controller.deleteReply);
router.post("/flag", requireAuth, controller.flagThought);
router.post("/replies/flag", requireAuth, controller.flagReply);
export default router;
