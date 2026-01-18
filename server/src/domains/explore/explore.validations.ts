import Joi from "joi";

export const randomFilmsSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(1000)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 1000",
    }),
});
