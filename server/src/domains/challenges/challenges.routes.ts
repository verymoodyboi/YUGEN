import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/requireAuth.js";
import * as controller from "./challenges.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// My films (for submitting)
router.get("/my/films", requireAuth, controller.getMyFilms);
// Public listing
router.get("", controller.listAdminChallenges);
router.get("/community-challenges", controller.listCommunityChallenges);
router.get("/academic-challenges", controller.listAcademicChallenges);
router.get("/user-challenges", controller.listUserChallenges);

// Challenge detail (requires auth)
router.get("/:id", requireAuth, controller.getChallenge);
router.get("/:id/films", requireAuth, controller.getChallengeFilms);
router.get("/:id/submission", requireAuth, controller.getSubmission);



// Submission endpoints
router.post("/:id/submit", requireAuth, controller.submitFilm);
router.delete("/:id/remove", requireAuth, controller.removeSubmission);

// Voting endpoints
router.get("/:id/vote", requireAuth, controller.getVote);
router.post("/:id/vote", requireAuth, controller.toggleVote);

// Creation & management
router.post("/create", requireAuth, upload.single("cover"), controller.createChallenge);

// Pending / accept / remove film (admin or challenge owner)
router.get("/:id/pending-films", requireAuth, controller.getPendingFilms);
router.put("/:id/films/:filmUuid/accept", requireAuth, controller.acceptFilm);
router.delete("/:id/films/:filmUuid", requireAuth, controller.removeFilm);

// Edit
router.put("/:id/edit", requireAuth, controller.editChallenge);

// Podium endpoints
router.get("/:id/podium", requireAuth, controller.getPodium);
router.post("/:id/podium/save", requireAuth, controller.savePodium);

export default router;
