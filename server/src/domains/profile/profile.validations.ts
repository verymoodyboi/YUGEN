import Joi from 'joi';

export const socialsSchema = Joi.object({
  Insta: Joi.string().allow(null, '').optional(),
  YT: Joi.string().allow(null, '').optional(),
  LI: Joi.string().allow(null, '').optional(),
});

export const editProfileSchema = Joi.object({
  FName: Joi.string().allow('', null).optional(),
  LName: Joi.string().allow('', null).optional(),
  UserName: Joi.string().min(3).optional(),
  Bio: Joi.string().max(500).allow('', null).optional(),
  Gender: Joi.string().allow('', null).optional(),
  Region: Joi.allow('', null).optional(),
  contactInfo: Joi.string().allow('', null).optional(),
    contactNumber: Joi.any().allow('', null).optional(),

    pfpContentType: Joi.any().optional(),

}).unknown(true);


export const preRegisterSocialsSchema = Joi.object({
  Username: Joi.string().required(),
  Insta: Joi.string().uri().allow(null, ''),
  YT: Joi.string().uri().allow(null, ''),
  LI: Joi.string().uri().allow(null, ''),
});


export const schoolSchema = Joi.object({
  school: Joi.string().required(),
});




export const contactInfoSchema = Joi.object({
  contactEmail: Joi.string().email().optional(),
  contactNumber: Joi.string().optional(),
}).or("contactEmail", "contactNumber");