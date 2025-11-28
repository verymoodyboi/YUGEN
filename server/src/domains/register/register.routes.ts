
import { Router } from 'express';
import multer from 'multer';
import * as registerController from './register.controller.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, registerGoogleSchema } from './register.validations.js';

const router = Router();
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  uploadMemory.single('PFP'),
  validate(registerSchema),
  registerController.register
);

router.post(
  '/google',
  uploadMemory.single('PFP'),
  validate(registerGoogleSchema),
  registerController.registerGoogle
);

export default router;
