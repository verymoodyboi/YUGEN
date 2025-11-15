import Joi from 'joi';

export const checkSubscriptionSchema = Joi.object({
  artistId: Joi.string().uuid().required(),
});

export const subscribeSchema = Joi.object({
  artistId: Joi.string().uuid().required(),
});

export const unsubscribeSchema = Joi.object({
  artistId: Joi.string().uuid().required(),
});

export const updateNotifySchema = Joi.object({
  artistId: Joi.string().uuid().required(),
  notify: Joi.boolean().required(),
});
