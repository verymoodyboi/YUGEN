import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as controller from './playlists.controller.js';

const router = Router();

// GET
router.get('/user',  controller.getUserPlaylists);
router.get('/:id/films',  controller.getPlaylistFilms);
router.get('/:id/meta',  controller.getPlaylistMeta);
router.get('/my',  controller.getMyPlaylists);
router.get('/check-listed',  controller.checkListed);
router.get('/checkPublic',  controller.checkPublic);
router.get('/saved/my',  controller.getMySavedPlaylists);
router.get('/saved/check',  controller.checkSaved);
// POST
router.post('/create',  controller.createPlaylist);
router.post('/add-to',  controller.addOrRemoveFilm);
router.post('/togglePublic',  controller.togglePublic);
router.post('/update-name',  controller.updateName);
router.post('/saved/toggle',  controller.toggleSavePlaylist);
// delete

router.delete('/',  controller.deletePlaylists);

export default router;


