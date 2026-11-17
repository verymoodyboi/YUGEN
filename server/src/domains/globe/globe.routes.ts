import express from "express";
import {
  fetchFilmsByCountry,
  fetchCountryStats,
  getArtistsByCountry,
} from "./globe.controller.js";

const router = express.Router();

router.get("/:name/films", fetchFilmsByCountry);

router.get("/:name/stats", fetchCountryStats);

router.get("/:country/users", getArtistsByCountry);

export default router;
