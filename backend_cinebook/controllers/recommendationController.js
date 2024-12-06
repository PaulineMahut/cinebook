import { getUserMoviesWithGenres, getRecommendedMovies } from '../models/recommendationModel.js';

export const getRecommendationsController = async (req, res) => {
  const userId = req.user.userId; // Get the userId from the token

  try {
    // Fetch movies the user has already added along with their genres
    const userMovies = await getUserMoviesWithGenres(userId);

    // Extract unique genre IDs from the movies the user has added
    const genreIds = [...new Set(userMovies.flatMap(um => {
      if (um.movie && um.movie.genres && um.movie.genres.length > 0) {
        return um.movie.genres.map(g => g.id);
      } else {
        return []; // If the movie has no genres, return an empty array
      }
    }))];

    if (genreIds.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    // Find movies from the same genres that the user hasn't added yet
    const recommendedMovies = await getRecommendedMovies(genreIds, userId);

    res.status(200).json({ recommendations: recommendedMovies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};