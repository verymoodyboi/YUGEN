import Joi from 'joi';

export const sendPokeSchema = Joi.object({
  targetId: Joi.string().uuid().required(),
});

export const acceptPokeSchema = Joi.object({
  pokeId: Joi.string().uuid().required(),
});


export const deletePokeSchema = Joi.object({
  pokeId: Joi.string().uuid().required(),
});

export const pokeStatusSchema = Joi.object({
  profileUserId: Joi.string().uuid().required(),
});