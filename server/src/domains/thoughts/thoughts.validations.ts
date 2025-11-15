import Joi from 'joi';

export const addThoughtSchema = Joi.object({
  film_uuid: Joi.string().required(),
  rating: Joi.number().min(1).max(10).required(),
  comment: Joi.string().allow('', null),
});

export const deleteThoughtSchema = Joi.object({
  id: Joi.number().required(),
});
 
export const voteSchema = Joi.object({
  thoughtId: Joi.number().required(),
});

export const replySchema = Joi.object({
  thoughtId: Joi.number().required(),
  comment: Joi.string().min(1).required(),
});

export const replyVoteSchema = Joi.object({
  replyId: Joi.number().required(),
});

export const flagThoughtSchema = Joi.object({
  thoughtId: Joi.required(),
  reason: Joi.string().max(500).required()
});

export const flagReplySchema = Joi.object({
  replyId: Joi.required(),
  reason: Joi.string().max(500).required()
});
