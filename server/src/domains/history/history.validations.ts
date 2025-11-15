import Joi from 'joi';

export const addHistorySchema = Joi.object({
  filmId: Joi.string().uuid().required(),
});

export const removeHistorySchema = Joi.object({
  filmId: Joi.string().uuid().required(),
});
