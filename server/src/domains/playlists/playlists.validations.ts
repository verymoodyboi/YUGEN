import Joi from 'joi';

export const createPlaylistSchema = Joi.object({
  playlist_name: Joi.string().min(1).required(),
  is_public: Joi.boolean().optional(),
});

export const addToPlaylistSchema = Joi.object({
  playlistID: Joi.string().uuid().required(),
  filmID: Joi.string().uuid().required(),
});

export const checkListedSchema = Joi.object({
  playlistID: Joi.string().uuid().required(),
  filmID: Joi.string().uuid().required(),
});

export const togglePublicSchema = Joi.object({
  playlist_uuid: Joi.string().uuid().required(),
});

export const updateNameSchema = Joi.object({
  playlist_uuid: Joi.string().uuid().required(),
    newName: Joi.string().required(),

});
