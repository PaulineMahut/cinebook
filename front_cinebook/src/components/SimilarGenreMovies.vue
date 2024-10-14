<template>
  <div>
    <h2>Recommandations de Films</h2>
    <div v-if="loading">Chargement des recommandations...</div>
    <div v-else>
      <div v-if="movies.length === 0">Aucune recommandation disponible.</div>
      <div class="movie-list">
        <div class="movie" v-for="movie in movies" :key="movie.id">
          <img :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
          <h3>{{ movie.title }}</h3>
          <p>Note: {{ movie.vote_average }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchRecommendations } from '@/services/tmdbService'; // Vous aurez besoin de ce service

export default {
  data() {
    return {
      movies: [],
      loading: true,
    };
  },
  methods: {
    async loadRecommendations() {
      try {
        this.movies = await fetchRecommendations(); // Récupérer les recommandations
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations:', error);
      } finally {
        this.loading = false; // Fin du chargement
      }
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  mounted() {
    this.loadRecommendations();
  },
};
</script>

<style scoped>
.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.movie {
  width: 150px;
}
.movie img {
  width: 100%;
}
</style>
