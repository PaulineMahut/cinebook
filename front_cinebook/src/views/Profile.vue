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

      <div><UserMovieList/></div>
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
    UserMovieList
  },
  computed: {
    // On mappe l'état de Vuex pour obtenir le profil utilisateur
    ...mapState(['userProfile']),
  },
  async mounted() {
    // Au montage du composant, on déclenche la récupération du profil utilisateur
    await this.fetchUserProfile();
  },
  methods: {
    // Méthode pour aller chercher le profil utilisateur depuis l'API via Vuex
    async fetchUserProfile() {
      await this.$store.dispatch('fetchUserProfile');
    },
  },
};
</script>


<style scoped>
/* Ajoutez vos styles ici */
</style>
