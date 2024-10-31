import { config } from '../../config';

const API_KEY = config.apiKey;
const BASE_URL = config.baseUrl;
const BACKEND_URL = config.backendUrl;
const LANGUAGE = 'fr-FR'; // Set the language to French

export async function fetchMovies(query) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${LANGUAGE}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  const data = await response.json();
  return data.results;
}

export async function fetchMoviesByCriteria(genreId = null, year = null, query = '') {
  try {
    let url;

    if (query) {
      // Recherche par titre
      url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=${LANGUAGE}`;
    } else {
      // Recherche avancée par genre et/ou année
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}`;
      if (genreId) url += `&with_genres=${genreId}`;
      if (year) url += `&primary_release_year=${year}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch movies');
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${LANGUAGE}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }
  
  const data = await response.json();
  return data; // Inclut poster_path, title, overview, etc.
}

export async function fetchPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular movies');
  }
  const data = await response.json();
  return data.results;
}

export async function fetchUserAddedMoviesWithGenres() {
  const token = localStorage.getItem('token'); // Récupérez le token du stockage local
  const response = await fetch(`${BACKEND_URL}/api/userMovies?language=${LANGUAGE}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user added movies with genres');
  }

  return response.json(); // Retourner les films ajoutés par l'utilisateur avec genres
}

export async function fetchMovieGenres() {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${LANGUAGE}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movie genres');
  }
  const data = await response.json();
  return data.genres; // Retourner la liste des genres
}

export async function fetchMoviesByGenre(genreId) {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=${LANGUAGE}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies by genre');
  }
  const data = await response.json();
  return data.results;
}

export async function fetchUserAddedMovies() {
  const token = localStorage.getItem('token'); // Récupérez le token du stockage local
  const response = await fetch(`${BACKEND_URL}/api/userMovies?language=${LANGUAGE}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
      },
  });

  if (!response.ok) {
      throw new Error('Failed to fetch user added movies');
  }

  return response.json(); // Retourner les films ajoutés par l'utilisateur
}

export async function fetchSimilarMovies(genreId) {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=${LANGUAGE}`);
  if (!response.ok) {
      throw new Error('Failed to fetch similar movies');
  }
  return response.json(); // Retourner les films similaires
}

export async function fetchRecommendations() {
  const token = localStorage.getItem('token'); // Récupérez le token du stockage local
  const response = await fetch(`${BACKEND_URL}/api/recommendations?language=${LANGUAGE}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
      },
  });

  if (!response.ok) {
      throw new Error('Échec de la récupération des recommandations');
  }

  return response.json(); // Retourner les films recommandés
}