import Joi from 'joi';

export const registerSchema = Joi.object({
  FName: Joi.string().required(),
  LName: Joi.string().required(),
  UserName: Joi.string().required(),
  Bio: Joi.string().allow('', null),
  Email: Joi.string().email().required(),
  Password: Joi.string().min(6).required(),
  BirthDate: Joi.string().required(),
  Gender: Joi.string().required(),
  Region: Joi.string().required(),
});

export const registerGoogleSchema = Joi.object({
  FName: Joi.string().required(),
  LName: Joi.string().required(),
  UserName: Joi.string().required(),
  Bio: Joi.string().allow('', null),
  Email: Joi.string().email().required(),
  BirthDate: Joi.string().required(),
  Gender: Joi.string().required(),
  Region: Joi.string().required(),
  auth_id: Joi.string().required(),
});
