<template>
  <div class="container-dashboard">
    <div class="msg-bienvenue">
      <h3>Hello {{ userName }} ! 👋</h3>
      <h2>Quoi de prévu aujourd'hui ?</h2>
    </div>
    <div v-if="notificationMessage" :class="notificationClass">
      {{ notificationMessage }}
      <button @click="clearNotification" class="close-btn">&times;</button>
    </div>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    <MovieList />
    <div class="shortcuts">
      <router-link to="/add-group" class="shortcut" style="background-color: #F7B3C0;">
        <i class="fas fa-users"></i>
      </router-link>
      <router-link to="/add-list" class="shortcut" style="background-color: #ABCDD9;">
        <i class="fas fa-list"></i>
      </router-link>
      <router-link to="/map" class="shortcut" style="background-color: #e6ec9a;">
        <i class="fas fa-map"></i>
      </router-link>
      <router-link to="/profile" class="shortcut" style="background-color: #ADD1B9;">
        <i class="fas fa-user"></i>
      </router-link>
    </div>
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

.shortcuts {
  display: flex;
  justify-content: space-evenly;
  gap: 20px;
  margin-bottom: 100px;
  margin-top: 100px;
}

.shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 100px;
  text-align: center;
  text-decoration: none;
  color: white;
  transition: background-color 0.3s;
}

.shortcut:hover {
  background-color: #e0e4e8; /* Couleur de fond pastel plus foncée au survol */
}

.shortcut .fa-users, .shortcut .fa-list, .shortcut .fa-map, .shortcut .fa-user {
  font-size: 25px !important;
}

.shortcut p {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.msg-bienvenue {
  margin-bottom: 50px;
}

.msg-bienvenue h3 {
  margin-bottom: 10px;
  color: #ffffff7d;}

.container-dashboard {
  margin: 0 auto; /* Centrer le contenu */
  padding: 0 20px; /* Ajouter un padding pour éviter que le contenu touche les bords */
  max-width: 1400px; /* Limiter la largeur maximale */
  margin-top: 50px;
}

/* Breakpoints pour différentes tailles d'écran */
@media (max-width: 1200px) {
  .container-dashboard {
    padding: 0 40px; /* Réduire les marges latérales pour les écrans moyens */
  }
}

@media (max-width: 992px) {
  .container-dashboard {
    padding: 0 30px;
  }
}

@media (max-width: 768px) {
  .container-dashboard {
    padding: 0 20px;
    margin-top: 30px;
  }
}

@media (max-width: 576px) {
  .container-dashboard {
    padding: 0 10px; /* Réduire encore plus les marges pour les petits écrans */
    margin-top: 20px;
  }

  .shortcuts .shortcut {
    width: 60px;
    height: 60px;
    border-radius: 80px;
  }
}
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