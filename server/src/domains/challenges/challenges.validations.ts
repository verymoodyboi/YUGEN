import Joi from "joi";

export const listQuerySchema = Joi.object({
  offset: Joi.number().integer().min(0).optional(),
  limit: Joi.number().integer().min(1).optional(),
  auth_id: Joi.string().optional(),
});

export const createChallengeSchema = Joi.object({
  challenge_name: Joi.string().min(3).max(200).required(),
  challenge_discription: Joi.string().allow("", null).optional(),
  challenge_rules: Joi.string().allow("", null).optional(), // JSON string
  is_academic: Joi.string().valid("true", "false").required(),
  allowNonStudents: Joi.string().valid("true", "false").required(),
  uniName: Joi.string().allow("", null).optional(),
  deadline: Joi.string().isoDate().allow("", null).optional(),
  rankingSystem: Joi.string().allow("", null).optional(),
  podium: Joi.any().optional(),
});

export const editChallengeSchema = Joi.object({
  deadlineExtension: Joi.optional(),
  rules: Joi.array().optional(),
});

export const savePodiumSchema = Joi.object({
  podium: Joi.array()
    .items(
      Joi.object({
        film_uuid: Joi.string().required(),
        rank: Joi.number().integer().required(),
      })
    )
    .required(),
});
