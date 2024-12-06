import express from 'express';
import { createMovieListController, addMovieToListController, getMovieListsController, getMovieListController, deleteMovieListController, deleteMovieFromListController, shareMovieListController, getSharedListsByUserIdController, getSharedListsByGroupIdController, isListSharedWithGroupController } from '../controllers/movieListController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/movie-lists', authenticateJWT, createMovieListController);
router.post('/movie-lists/:listId/items', authenticateJWT, addMovieToListController);
router.get('/movie-lists', authenticateJWT, getMovieListsController);
router.get('/movie-lists/:id', authenticateJWT, getMovieListController);
router.delete('/movie-lists/:listId', authenticateJWT, deleteMovieListController);
router.delete('/movie-lists/:listId/items/:itemId', authenticateJWT, deleteMovieFromListController);
router.post('/movie-lists/:listId/share', authenticateJWT, shareMovieListController);
router.get('/user/shared-lists', authenticateJWT, getSharedListsByUserIdController);
router.get('/groups/:groupId/lists', authenticateJWT, getSharedListsByGroupIdController);
router.get('/movie-lists/:listId/shared', authenticateJWT, isListSharedWithGroupController);

export default router;