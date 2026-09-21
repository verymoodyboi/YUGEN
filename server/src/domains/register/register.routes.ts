
import { Router } from 'express';
import multer from 'multer';
import * as registerController from './register.controller.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, registerGoogleSchema, deleteAccountSchema } from './register.validations.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

const router = Router();
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  validate(registerSchema),
  registerController.register
);

router.post(
  '/google',
  validate(registerGoogleSchema),
  registerController.registerGoogle
);

router.post(
  '/delete',
  requireAuth,
  validate(deleteAccountSchema),
  registerController.deleteAccount
);


export default router;
