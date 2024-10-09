<template>
  <div v-if="movie">
    <h1>{{ movie.title }}</h1>
    <img :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
    <p>{{ movie.overview }}</p>
    <p>Release Date: {{ movie.release_date }}</p>
    <p>Rating: {{ movie.vote_average }}</p>
    <button @click="addMovieToDatabase(movie.id)">Add to Database</button>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { fetchMovieDetails } from '@/services/tmdbService';

export default {
  data() {
    return {
      movie: null,
      errorMessage: '',
    };
  },
  methods: {
    async loadMovieDetails() {
      try {
        const movieId = this.$route.params.id;
        this.movie = await fetchMovieDetails(movieId);
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async addMovieToDatabase(movieId) {
    try {
        const movieDetails = await fetchMovieDetails(movieId);

        const token = localStorage.getItem('token'); // Récupérez le token du stockage local

        const response = await fetch('http://localhost:3000/api/movies/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
            },
            body: JSON.stringify({
                title: movieDetails.title,
                overview: movieDetails.overview,
                voteAverage: movieDetails.vote_average,
                tmdbId: movieDetails.id, // Assurez-vous d'inclure l'ID du film de TMDB
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add movie to database');
        }

        const addedMovie = await response.json();
        console.log('Movie added:', addedMovie);
    } catch (error) {
        console.error(error);
    }
},

    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  mounted() {
    this.loadMovieDetails();
  },
};
</script>
