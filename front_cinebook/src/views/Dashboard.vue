<template>
    <div>
      <LogoutBouton />
      <div>
        <h3>Hello {{ userName }}! 👋</h3>
        <h5>Quoi de prévu aujourd'hui ?</h5>
      </div>
      <div v-if="errorMessage">{{ errorMessage }}</div>
      <MovieList />
      <SearchByGenre />
      <FavoriteMovies />
      <PopularMovies />
      <RandomGenreMovies />
      <RecommendedMovies />
    </div>
  </template>
  
  <script>
  import LogoutBouton from '@/components/LogoutBouton.vue';
  import MovieList from '@/components/MovieList.vue';
  import PopularMovies from '@/components/PopularMovies.vue';
  import FavoriteMovies from '@/components/FavoriteMovies.vue'; // Import du composant
  import { fetchMovieGenres } from '@/services/tmdbService'; // Importer votre fonction
  import RandomGenreMovies from '../components/RandomGenreMovies.vue';
  import SearchByGenre from '../components/SearchByGenre.vue';
  import RecommendedMovies from '../components/RecommendedMovies.vue';
  
  export default {
    name: 'Dashboard',
    components: {
      LogoutBouton,
      MovieList,
      PopularMovies,
      FavoriteMovies,
      RecommendedMovies,
      SearchByGenre,
      RandomGenreMovies,
    },
    data() {
      return {
        errorMessage: '',
        genres: [],
        userName: '', // Ajouter une propriété pour le nom de l'utilisateur
      };
    },
    async created() {
      try {
        this.genres = await fetchMovieGenres(); // Récupérer les genres lors de la création du composant
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userName = payload.pseudo ? payload.pseudo : payload.email; // Récupérer le pseudo ou l'email de l'utilisateur à partir du token
        }
      } catch (error) {
        this.errorMessage = error.message; // Gérer les erreurs
      }
    },
  };
  </script>
  
  <style scoped>
  /* Ajoute ici tes styles pour la page d'accueil */
  </style>