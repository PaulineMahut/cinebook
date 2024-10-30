<template>
  <div>
    <!-- Vérification si userProfile existe avant d'afficher les informations -->
    <div v-if="userProfile">
      <p>Email de l'utilisateur : {{ userProfile.email }}</p>
      <p>Pseudo de l'utilisateur : {{ userProfile.pseudo }}</p>
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
    GROUPES
    <router-link to="/add-group">
      <button>Ajouter un Groupe</button>
    </router-link>
    <UserGroups />
  </div>

  <div>
    <CreateMovieList />
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
</template>

<script>
import { mapState } from 'vuex';
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
    ...mapState(['userProfile']),
  },
  async mounted() {
    // Au montage du composant, on déclenche la récupération du profil utilisateur
    await this.fetchUserProfile();
    await this.loadSharedLists();
  },
  methods: {
    // Méthode pour aller chercher le profil utilisateur depuis l'API via Vuex
    async fetchUserProfile() {
      await this.$store.dispatch('fetchUserProfile');
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
  },
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>