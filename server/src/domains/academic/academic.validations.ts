import Joi from 'joi';

export const academicApplicationSchema = Joi.object({
  email: Joi.string().email().required(),
  university: Joi.string().required(),
  role: Joi.string().required(),
  username: Joi.string().required(),
  uniID: Joi.string().required(),
});

export const queryUsernameSchema = Joi.object({
  username: Joi.string().required(),
});
