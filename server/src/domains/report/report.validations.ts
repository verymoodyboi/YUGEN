import Joi from 'joi';

export const filmReportSchema = Joi.object({
  auth_id: Joi.string().uuid().required(),
  reportType: Joi.string().required(),
  report: Joi.string().required(),
  film_id: Joi.string().uuid().required(),
});

export const techReportSchema = Joi.object({
  auth_id: Joi.string().uuid().required(),
  reportType: Joi.string().required(),
  report: Joi.string().required(),
});
