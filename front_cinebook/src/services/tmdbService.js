const API_KEY = '925a9043f860f19987be96d64f2332c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKEND_URL = 'http://localhost:3000'; // URL de votre backend


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
  


// FAVORIS

export async function fetchFavorites() {
    const response = await fetch(`${BACKEND_URL}/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    return await response.json();
  }
  
  export async function addFavorite(movieId) {
    const token = localStorage.getItem('token'); // Récupérez le token
    const response = await fetch('http://localhost:3000/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Utilisez le token ici
        },
        body: JSON.stringify({ movieId }), // Assurez-vous que c'est movieId
    });

    if (!response.ok) {
        const errorText = await response.text(); // Obtenez le texte de la réponse
        throw new Error(`Failed to add to favorites: ${errorText}`); // Incluez le message d'erreur
    }
    return await response.json();
}

  
  export async function removeFavorite(id) {
    const response = await fetch(`${BACKEND_URL}/favorites/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }
  }