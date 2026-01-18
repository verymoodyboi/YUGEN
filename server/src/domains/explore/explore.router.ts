import { Router } from "express";
import { fetchRandomFilms } from "./explore.controller.js";

const router = Router();

router.get("/random", fetchRandomFilms);

export default router;
