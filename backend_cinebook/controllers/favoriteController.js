import { addFavorite, getFavoriteMovies, checkMovieExists, deleteFavorite, checkUserMovieExists } from '../models/favoriteModel.js';

export const addFavoriteController = async (req, res) => {
  const userId = req.user.userId;
  const movieData = req.body;

  try {
    const result = await addFavorite(userId, movieData);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
};

export const getFavoriteMoviesController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await getFavoriteMovies(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).send('Server error');
  }
};

export const checkMovieExistsController = async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);

  try {
    const movie = await checkMovieExists(tmdbId);
    if (movie) {
      return res.status(200).json(movie);
    }
    res.status(404).json({ error: 'Movie not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve movie' });
  }
};

export const deleteFavoriteController = async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const userId = req.user.userId;

  try {
    const result = await deleteFavorite(userId, tmdbId);
    res.status(204).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove movie' });
  }
};

export const checkUserMovieExistsController = async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const userId = req.user.userId;

  try {
    const result = await checkUserMovieExists(userId, tmdbId);
    res.status(result.exists ? 200 : 404).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check movie association' });
  }
};