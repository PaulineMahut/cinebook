<template>
  <div class="profile-page-container">
    <div v-if="notificationMessage" :class="notificationClass">
      {{ notificationMessage }}
      <button @click="clearNotification" class="close-btn">&times;</button>
    </div>
  <div class="profile-container">
    <!-- Vérification si userProfile existe avant d'afficher les informations -->
    <div v-if="userProfile" class="profile-card">
      <img :src="getProfilePictureUrl(userProfile.profilePicture)" alt="Photo de profil" class="profile-picture" />
      <h2 class="profile-pseudo">{{ userProfile.pseudo }}</h2>
      <div class="profile-stats">
        <div class="profile-stat">
          <h3>Amis</h3>
          <p>{{ friendCount }}</p>
        </div>
        <div class="profile-stat">
          <h3>Groupes</h3>
          <p>{{ groupCount }}</p>
        </div>
        <div class="profile-stat">
          <h3>Listes</h3>
          <p>{{ movieListCount }}</p>
        </div>
      </div>
    </div>
    <!-- Optionnel: Message d'erreur ou de chargement si le profil n'est pas encore disponible -->
    <div v-else>
      <p>Chargement des informations utilisateur...</p>
    </div>
  </div>

  <div>
    <FavoriteMovies />
  </div>

  <div>
    <UserGroups />
  </div>

  <div>
    <UserMovieList />
  </div>

  <div>
    <h3>Listes Partagées avec Mes Groupes</h3>
    <ul>
      <li v-for="sharedList in sharedLists" :key="sharedList.id">
        <router-link :to="{ name: 'MovieListDetails', params: { id: sharedList.list.id } }">
          {{ sharedList.list.name }}
        </router-link>
      </li>
    </ul>
  </div>
</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import FavoriteMovies from '@/components/FavoriteMovies.vue';
import UserGroups from '@/components/UserGroups.vue';
import CreateMovieList from '../components/CreateMovieList.vue';
import UserMovieList from '../components/UserMovieList.vue';

export default {
  components: {
    FavoriteMovies,
    UserGroups,
    CreateMovieList,
    UserMovieList,
  },
  data() {
    return {
      sharedLists: [],
    };
  },
  computed: {
    // On mappe l'état de Vuex pour obtenir le profil utilisateur
    ...mapState(['userProfile', 'friendCount', 'movieListCount', 'groupCount', 'notificationMessage']),
    notificationClass() {
      return this.notificationMessage.includes('succès') ? 'notification-success' : 'notification-error';
    },
  },
  methods: {
    ...mapActions(['fetchUserProfile', 'clearNotificationMessage']),
    // Méthode pour aller chercher le profil utilisateur depuis l'API via Vuex
    async fetchUserProfile() {
      await this.$store.dispatch('fetchUserProfile');
      console.log('Profil utilisateur:', this.userProfile);
      console.log('URL de la photo de profil:', this.userProfile.profilePicture);
      console.log('Nombre d\'amis:', this.friendCount);
      console.log('Nombre de listes créées:', this.movieListCount);
      console.log('Nombre de groupes:', this.groupCount);
    },
    async loadSharedLists() {
      const token = localStorage.getItem('token');
      console.log('Fetching shared lists');

      try {
        const response = await fetch('http://localhost:3000/api/user/shared-lists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.sharedLists = await response.json();
          console.log('Shared lists:', this.sharedLists);
        } else {
          console.error('Erreur lors de la récupération des listes partagées');
        }
      } catch (error) {
        console.error('Erreur de récupération des listes partagées:', error);
      }
    },
    getProfilePictureUrl(path) {
      if (path.startsWith('/images/')) {
      return `http://localhost:3000${path}`;
    } else if (path.startsWith('/uploads/')) {
      return `http://localhost:3000${path}`;
    } else {
      return `http://localhost:3000/uploads/${path}`;
    }      console.log('URL complète de la photo de profil:', url);
      return url;
    },
    clearNotification() {
      this.clearNotificationMessage();
    },
  },
  async mounted() {
    // Au montage du composant, on déclenche la récupération du profil utilisateur
    await this.fetchUserProfile();
    await this.loadSharedLists();
  },
};
</script>

<style scoped>

.notification-success {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  position: relative;
}

.notification-error {
  background-color: #f8d7da;
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

.profile-page-container {
  margin: 0 5em;
}

.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.profile-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
}

.profile-pseudo {
  margin-bottom: 20px;
  font-size: 24px;
  color: #343a40;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
}

.profile-stat {
  flex: 1;
  margin: 0 10px;
}

.profile-stat h3 {
  margin-bottom: 10px;
  font-size: 18px;
  color: #495057;
}

.profile-stat p {
  font-size: 16px;
  color: #6c757d;
}
</style>