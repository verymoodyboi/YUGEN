import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../../middlewares/requireAuth.js';
import {
  uploadFilmController,
  editFilmController,
  deleteFilmController,
  initializeUploadController,
  processUploadController,
  retryUploadController,
} from './films.controller.js';
import { validate } from '../../middlewares/validate.js';
import { uploadFilmSchema, editFilmSchema, deleteFilmSchema } from './films.validation.js';
import { moderationBeforeUpload } from "../../middlewares/modMiddleware.js";
import { authStatus } from '../authentication/authentication.controller.js';
const router = Router();
const upload = multer({ dest: '/tmp' });
const memUpload = multer({ storage: multer.memoryStorage() });




router.post(
  "/initialize-upload",
requireAuth,
  initializeUploadController
);

router.post(
  "/process-upload",
 requireAuth,
  processUploadController
);




// Upload film
router.post(
  "/upload",
 requireAuth,
  upload.fields([{ name: "Film" }, { name: "Poster" }]),
  validate(uploadFilmSchema),
  uploadFilmController 
);




router.post(
  "/retry-upload",
 requireAuth,
  retryUploadController
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
// router.post(
//   '/delete',
//  requireAuth,
//   validate(deleteFilmSchema),
//   deleteFilmController
// );

router.post(
  '/delete',
 requireAuth,
  // validate(deleteFilmSchema),
  deleteFilmController
);


export default router;
