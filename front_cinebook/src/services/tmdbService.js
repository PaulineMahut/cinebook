import { config } from '../../config';

const API_KEY = config.apiKey;
const BASE_URL = config.baseUrl;
const BACKEND_URL = config.backendUrl;


export async function fetchMovies(query) {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies');
  }
  const data = await response.json();
  return data.results;
}

export async function fetchMovieDetails(movieId) {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }
  const data = await response.json();
  return data;
}

export async function fetchPopularMovies() {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    const data = await response.json();
    return data.results;
}

// Service pour récupérer les films de l'utilisateur avec leurs genres
export async function fetchUserAddedMoviesWithGenres() {
  const token = localStorage.getItem('token'); // Récupérez le token du stockage local
  const response = await fetch('http://localhost:3000/api/userMovies', {
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
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movie genres');
  }
  const data = await response.json();
  return data.genres; // Retourner la liste des genres
}

export async function fetchMoviesByGenre(genreId) {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch movies by genre');
  }
  const data = await response.json();
  return data.results;
}

export async function fetchUserAddedMovies() {
  const token = localStorage.getItem('token'); // Récupérez le token du stockage local
  const response = await fetch('http://localhost:3000/api/userMovies', {
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
  const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`);
  if (!response.ok) {
      throw new Error('Failed to fetch similar movies');
  }
  return response.json(); // Retourner les films similaires
}

export async function fetchRecommendations() {
    const token = localStorage.getItem('token'); // Récupérez le token du stockage local
    const response = await fetch('http://localhost:3000/api/recommendations', {
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



// FAVORIS

// export async function fetchFavorites() {
//     const response = await fetch(`${BACKEND_URL}/favorites`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error('Failed to fetch favorites');
//     }
//     return await response.json();
//   }
  
//   export async function addFavorite(movieId) {
//     const token = localStorage.getItem('token'); // Récupérez le token
//     const response = await fetch('http://localhost:3000/favorites', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`, // Utilisez le token ici
//         },
//         body: JSON.stringify({ movieId }), // Assurez-vous que c'est movieId
//     });

//     if (!response.ok) {
//         const errorText = await response.text(); // Obtenez le texte de la réponse
//         throw new Error(`Failed to add to favorites: ${errorText}`); // Incluez le message d'erreur
//     }
//     return await response.json();
// }

  
//   export async function removeFavorite(id) {
//     const response = await fetch(`${BACKEND_URL}/favorites/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error('Failed to remove from favorites');
//     }
//   }