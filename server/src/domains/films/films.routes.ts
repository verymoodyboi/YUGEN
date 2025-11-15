import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../../middlewares/requireAuth.js';
import {
  uploadFilmController,
  editFilmController,
  deleteFilmController,
} from './films.controller.js';
import { validate } from '../../middlewares/validate.js';
import { uploadFilmSchema, editFilmSchema, deleteFilmSchema } from './films.validation.js';
import { moderationBeforeUpload } from "../../middlewares/modMiddleware.js"; // ✅ use pre-upload version
const router = Router();
const upload = multer({ dest: '/tmp' });
const memUpload = multer({ storage: multer.memoryStorage() });

// Upload film
router.post(
  "/upload",
  requireAuth,
  upload.fields([{ name: "Film" }, { name: "Poster" }]),
  validate(uploadFilmSchema),
  uploadFilmController // ✅ Only runs if moderation passes
);

// Edit film
router.post(
  '/edit',
  requireAuth,
  memUpload.single('Poster'),
  validate(editFilmSchema),
  editFilmController
);

// Delete film
router.post(
  '/delete',
  requireAuth,
  validate(deleteFilmSchema),
  deleteFilmController
);

export default router;
