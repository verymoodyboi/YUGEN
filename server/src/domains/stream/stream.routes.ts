import { Router } from 'express';
import * as streamController from './stream.controller.js';
import { filmIdParamSchema } from './stream.validation.js';
import { validate } from '../../middlewares/validate.js';
const router = Router();

router.get('/:filmId', validate(filmIdParamSchema), streamController.getFilm);
router.post('/:id/increment-view',  streamController.incrementView);
router.post('/:film_uuid/click',  streamController.clickFilm);

export default router;
