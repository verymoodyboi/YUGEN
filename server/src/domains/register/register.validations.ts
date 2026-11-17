import Joi from 'joi';
import { University } from 'lucide-react';

export const registerSchema = Joi.object({

  Email: Joi.string().email().required(),
  Password: Joi.string().min(6).required(),
 
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
    university: Joi.any().optional(),

});

export const deleteAccountSchema = Joi.object({

userID:Joi.string().required()
});
