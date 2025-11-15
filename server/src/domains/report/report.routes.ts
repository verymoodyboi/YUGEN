import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import * as reportController from './report.controller.js';
import { filmReportSchema, techReportSchema } from './report.validations.js';

const router = Router();

router.post('/film', validate(filmReportSchema), reportController.createFilmReport);
router.post('/technical', validate(techReportSchema), reportController.createTechReport);

export default router;
