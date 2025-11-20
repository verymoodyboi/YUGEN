import express from "express";
import {
  fetchFilmsByCountry,
  fetchCountryStats,
  getArtistsByCountry,
} from "./globe.controller.js";

const router = express.Router();

// Fetch all films from a specific country (ordered by view_count DESC)
router.get("/:name/films", fetchFilmsByCountry);

// Fetch film_count and artist_count for a specific country
router.get("/:name/stats", fetchCountryStats);

// Fetch artists from a specific country ordered by sub_count DESC
router.get("/:country/users", getArtistsByCountry);

export default router;
