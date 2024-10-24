<template>
  <div>
    <input type="text" v-model="query" @input="searchMovies" placeholder="Rechercher un film..." />
    <ul v-if="movies.length">
      <li v-for="movie in movies" :key="movie.id" @click="selectMovie(movie)">
        {{ movie.title }}
      </li>
    </ul>
  </div>
</template>

<script>
import { fetchMovies } from '@/services/tmdbService';

export default {
  data() {
    return {
      query: '',
      movies: [],
    };
  },
  methods: {
    async searchMovies() {
      if (this.query.length > 2) {
        try {
          this.movies = await fetchMovies(this.query);
        } catch (error) {
          console.error('Erreur lors de la recherche de films:', error);
        }
      } else {
        this.movies = [];
      }
    },
    selectMovie(movie) {
      this.$emit('movieSelected', movie);
      this.query = '';
      this.movies = [];
    },
  },
};
</script>

<style scoped>
/* Style pour la barre de recherche */
input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  cursor: pointer;
  padding: 5px;
  border-bottom: 1px solid #ccc;
}

li:hover {
  background-color: #f0f0f0;
}
</style>