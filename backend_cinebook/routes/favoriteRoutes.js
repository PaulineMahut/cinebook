import express from 'express';
import { addFavoriteController, getFavoriteMoviesController, checkMovieExistsController, deleteFavoriteController, checkUserMovieExistsController } from '../controllers/favoriteController.js';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

router.post('/movies/add', authenticateJWT, addFavoriteController);
router.get('/movies/:tmdbId', authenticateJWT, checkMovieExistsController);
router.delete('/movies/:tmdbId', authenticateJWT, deleteFavoriteController);
router.get('/userMovies/:tmdbId', authenticateJWT, checkUserMovieExistsController);
router.get('/userMovies', authenticateJWT, getFavoriteMoviesController);
router.get('/movies', authenticateJWT, getFavoriteMoviesController);

export default router;