import Joi from 'joi';

export const filmIdParamSchema = Joi.object({
  filmId: Joi.string().uuid().required(),
});

export const incrementViewParamSchema = Joi.object({
  id: Joi.string().required(),
});

export const clickParamSchema = Joi.object({
  film_uuid: Joi.required(),
  
});
