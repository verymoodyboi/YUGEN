import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './profile.controller.js';

const router = Router();

router.post('/type', requireAuth, controller.addUserType);

router.post('/socials', requireAuth, controller.updateSocials);
const upload = multer(); 
router.post('/edit', requireAuth, upload.single('PFP'), controller.editProfile);
router.post('/pre-socials', controller.preRegisterSocials);
router.post("/addSchool", requireAuth, controller.addSchool);


router.get("/contact", requireAuth, controller.getContactInfo);
router.post("/contact", requireAuth, controller.updateContactInfo);

router.post("/edit_helper_pfp_compress", requireAuth, controller.compressPfp);


export default router;
