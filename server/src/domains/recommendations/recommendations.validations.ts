import Joi from "joi";

export const paginationSchema = Joi.object({
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(50).default(5),
});

export const personalizedSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(5),
});

export const genreSchema = Joi.object({
  genre: Joi.string().required(),
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(5),
});
