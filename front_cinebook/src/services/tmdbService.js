// const API_KEY = '925a9043f860f19987be96d64f2332c8';
// const BASE_URL = 'https://api.themoviedb.org/3';
// const BACKEND_URL = 'http://localhost:3000'; // URL de votre backend


// export async function fetchMovies(query) {
//   const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch movies');
//   }
//   const data = await response.json();
//   return data.results;
// }

// export async function fetchMovieDetails(movieId) {
//   const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch movie details');
//   }
//   const data = await response.json();
//   return data;
// }

// export async function fetchPopularMovies() {
//     const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch popular movies');
//     }
//     const data = await response.json();
//     return data.results;
// }
  


// // FAVORIS

// export async function addFavoris(movie) {
//     const token = localStorage.getItem('token'); // Récupérer le token JWT
//     if (!token) {
//         throw new Error("Token is missing. Please log in.");
//     }

//     const response = await fetch(`${BACKEND_URL}/api/favoris`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}` // Ajouter le token JWT
//         },
//         body: JSON.stringify({
//             movieId: movie.id,
//             title: movie.title,
//             posterPath: movie.poster_path
//         }),
//     });

//     if (!response.ok) {
//         const errorResponse = await response.json();
//         throw new Error(errorResponse.error || 'Failed to add favoris');
//     }

//     return await response.json();
// }

//   export async function removeFavoris(id) {
//     const response = await fetch(`${BACKEND_URL}/api/favoris/${id}`, {
//       method: 'DELETE',
//     });
  
//     if (!response.ok) {
//       throw new Error('Failed to remove favoris');
//     }
  
//     return await response.json();
//   }
  
//   export async function getFavoris() {
//     const response = await fetch(`${BACKEND_URL}/api/favoris`, {
//       method: 'GET',
//     });
  
//     if (!response.ok) {
//       throw new Error('Failed to fetch favoris');
//     }
  
//     return await response.json();
//   }