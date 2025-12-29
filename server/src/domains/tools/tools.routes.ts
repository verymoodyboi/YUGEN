import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import * as controller from "./tools.controller.js";

const router = Router();

// Email + Username availability
router.get("/emailCheck", controller.checkEmail);
router.get("/usernameCheck", controller.checkUsername);
router.get("/getUserInfo", controller.getUserInfo);
router.get("/checkFirstTimer",  requireAuth, controller.checkFirstTimer);
router.post(
  "/complete-first-login",
  requireAuth,
  controller.completeFirstLoginController
);



export default router;
