import Joi from "joi";

export const toggleWatchlistSchema = Joi.object({
  filmID: Joi.string().uuid().required(),
});

export const checkWatchlistSchema = Joi.object({
  filmID: Joi.string().uuid().required(),
});
