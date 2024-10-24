<template>
  <div>
    <input
      type="text"
      v-model="query"
      @input="searchMovies"
      placeholder="Rechercher un film..."
    />
    <ul v-if="movies.length">
      <li v-for="movie in movies" :key="movie.id" @click="selectMovie(movie)">
        <!-- Ajouter l'affiche du film si elle est disponible -->
        <img
          v-if="movie.poster_path"
          :src="getPosterUrl(movie.poster_path)"
          alt="Affiche du film"
          class="poster"
        />
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
    // Générer l'URL de l'affiche en fonction du poster_path
    getPosterUrl(posterPath) {
      return `https://image.tmdb.org/t/p/w200${posterPath}`;
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
  display: flex;
  align-items: center;
}

li:hover {
  background-color: #f0f0f0;
}

/* Style pour les affiches des films */
.poster {
  width: 50px;
  height: auto;
  margin-right: 10px;
}
</style>
