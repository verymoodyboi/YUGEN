import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './playlists.controller.js';

const router = Router();

// GET
router.get('/user',requireAuth,  controller.getUserPlaylists);
router.get('/:id/films',requireAuth,  controller.getPlaylistFilms);
router.get('/:id/meta',requireAuth,  controller.getPlaylistMeta);
router.get('/my',requireAuth,  controller.getMyPlaylists);
router.get('/check-listed',requireAuth,  controller.checkListed);
router.get('/checkPublic',requireAuth,  controller.checkPublic);
router.get('/saved/my',requireAuth,  controller.getMySavedPlaylists);
router.get('/saved/check',requireAuth,  controller.checkSaved);
// POST
router.post('/create',requireAuth,  controller.createPlaylist);
router.post('/add-to',requireAuth,  controller.addOrRemoveFilm);
router.post('/togglePublic',requireAuth,  controller.togglePublic);
router.post('/update-name',requireAuth,  controller.updateName);
router.post('/saved/toggle',requireAuth,  controller.toggleSavePlaylist);
// delete

router.delete('/', requireAuth, controller.deletePlaylists);

export default router;


