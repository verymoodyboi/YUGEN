import Joi from "joi";


export const searchSchema = Joi.object({
  query: Joi.string().min(2).required(),
  offset: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(50).default(5),
});
