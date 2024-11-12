<template>
  <div>
    <div>
      <h3>Hello {{ userName }}! 👋</h3>
      <h5>Quoi de prévu aujourd'hui ?</h5>
    </div>
    <!-- <div v-if="notificationMessage" :class="notificationClass">
      {{ notificationMessage }}
      <button @click="clearNotification" class="close-btn">&times;</button>
    </div> -->
    <div v-if="errorMessage">{{ errorMessage }}</div>
    <MovieList />
    <!-- <SearchByGenre /> -->
    <FavoriteMovies />
    <PopularMovies />
    <RandomGenreMovies />
    <RecommendedMovies />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
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
  computed: {
    ...mapState({
      notificationMessage: state => state.notificationMessage, // Ajoutez cette ligne
    }),
    notificationClass() {
      return this.notificationMessage.includes('déconnecté') ? 'notification-error' : 'notification-success';
    },
  },
  methods: {
    ...mapActions(['clearNotificationMessage']),
    clearNotification() {
      this.clearNotificationMessage();
    },
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
.notification-success {
  background-color: #d4edda; /* Vert clair pour les notifications de succès */
  color: #155724;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  position: relative;
}

.notification-error {
  background-color: #f8d7da; /* Rouge clair pour les notifications d'erreur */
  color: #721c24;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>