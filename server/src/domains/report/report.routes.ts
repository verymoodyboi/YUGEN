import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import * as reportController from './report.controller.js';
import { filmReportSchema, techReportSchema } from './report.validations.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

const router = Router();

router.post('/film',requireAuth, validate(filmReportSchema), reportController.createFilmReport);
router.post('/technical',requireAuth, validate(techReportSchema), reportController.createTechReport);

export default router;
