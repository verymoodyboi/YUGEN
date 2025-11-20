// src/features/explore/explore.controller.ts
import { Request, Response } from "express";
import { getRandomFilms } from "./explore.services.js";
import { randomFilmsSchema } from "./explore.validations.js";

export const fetchRandomFilms = async (req: Request, res: Response) => {
  try {
    const { error, value } = randomFilmsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { limit } = value;
    const films = await getRandomFilms(limit);

    res.status(200).json({
      success: true,
      count: films.length,
      data: films,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch random films",
    });
  }
};
