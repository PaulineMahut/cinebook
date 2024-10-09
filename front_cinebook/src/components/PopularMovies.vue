<template>
  <div>
    <h2>Popular Movies</h2>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    <div v-if="movies.length" class="movies-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-item">
        <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
          <img :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
          <h3>{{ movie.title }}</h3>
          <p>{{ movie.release_date }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchPopularMovies } from '@/services/tmdbService';

export default {
  data() {
    return {
      movies: [],
      errorMessage: '',
    };
  },
  methods: {
    async loadPopularMovies() {
      try {
        this.errorMessage = '';
        this.movies = await fetchPopularMovies();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  mounted() {
    this.loadPopularMovies();
  },
};
</script>

<style>
.movies-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.movie-item {
  width: 200px;
  text-align: center;
}

.movie-item img {
  width: 100%;
  height: auto;
}
</style>