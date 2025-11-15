import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './academic.controller.js';

const uploadMemory = multer(); // in-memory storage
const router = Router();

router.post('/', uploadMemory.single('verificationFile'), controller.registerAcademic);
router.get('/', requireAuth, controller.getAcademicApplication);
router.delete('/', requireAuth, controller.deleteAcademicApplication);

export default router;
