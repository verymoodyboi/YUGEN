// src/features/explore/explore.routes.ts
import { Router } from "express";
import { fetchRandomFilms } from "./explore.controller.js";

const router = Router();

// GET /api/explore/random?limit=500
router.get("/random", fetchRandomFilms);

export default router;
