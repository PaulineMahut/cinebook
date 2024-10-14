<template>
  <div>
    <h1>Movies by Genre</h1>
    
    <div>
      <label for="genre-select">Select Genre:</label>
      <select id="genre-select" v-model="selectedGenreId" @change="loadMoviesByGenre">
        <option v-for="genre in genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>
    </div>

    <div v-if="movies.length">
      <h2>Movies:</h2>
      <ul>
        <li v-for="movie in movies" :key="movie.id">
          <h3>{{ movie.title }}</h3>
          <img :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
          <p>{{ movie.overview }}</p>
          <p>Release Date: {{ movie.release_date }}</p>
          <p>Rating: {{ movie.vote_average }}</p>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>No movies found for this genre.</p>
    </div>
  </div>
</template>

<script>
import { fetchMoviesByGenre, fetchMovieGenres } from '@/services/tmdbService';

export default {
  data() {
    return {
      genres: [],
      selectedGenreId: null,
      movies: [],
    };
  },
  methods: {
    async loadGenres() {
      try {
        this.genres = await fetchMovieGenres();
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    },
    
    async loadMoviesByGenre() {
      if (this.selectedGenreId) {
        try {
          this.movies = await fetchMoviesByGenre(this.selectedGenreId);
        } catch (error) {
          console.error('Failed to fetch movies:', error);
        }
      }
    },

    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
  },
  mounted() {
    this.loadGenres();
  },
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
