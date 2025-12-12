import Joi from "joi";

export const checkEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const checkUsernameSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
});

export const getUserInfoSchema = Joi.object({
  userID: Joi.string().required(),
});