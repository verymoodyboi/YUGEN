import Joi from 'joi';

export const uploadFilmSchema = Joi.object({
  Title: Joi.string().required(),
  Thesis: Joi.string().required(),
  Genres: Joi.string().required(),
  Country: Joi.string().optional(),
  Crew: Joi.string().optional(),
  Cast: Joi.string().optional(),
});

export const editFilmSchema = Joi.object({
  Film_id: Joi.string().required(),
  Title: Joi.string().required(),
  Thesis: Joi.string().required(),
  Genres: Joi.string().required(),
  Country: Joi.string().optional(),
  Crew: Joi.string().optional(),
  Cast: Joi.string().optional(),
});

export const deleteFilmSchema = Joi.object({
  film_uuid: Joi.string().required(),
});
