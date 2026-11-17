import { Router } from 'express';
import * as reportController from './support_tickets.controller.js';
import { requireAuth } from '../../../middlewares/requireAuth.js';

const router = Router();

router.post('/technical',requireAuth, reportController.createTechReport);

// Support tickets list + reply — swap requireAuth for an admin-only
// middleware if you have one (the same one guarding reported accounts).
router.get('/technical', requireAuth, reportController.listTechReports);
router.post('/technical/:id/reply', requireAuth, reportController.replyToTechReportController);

router.post("/account", requireAuth, reportController.submitAccountReportController);
 

export default router;