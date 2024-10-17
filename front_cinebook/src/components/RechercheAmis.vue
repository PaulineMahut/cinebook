<template>
  <div class="profile-page">
      <h1>Recherche</h1>

      <!-- Recherche d'utilisateurs -->
      <div class="search-section">
          <h2>Rechercher un utilisateur</h2>
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher un utilisateur..."
              @input="searchUsers"
          />

          <!-- Afficher les résultats de recherche seulement si au moins 2 caractères sont saisis -->
          <ul v-if="searchResults.length">
              <li v-for="user in searchResults" :key="user.id">
                  <router-link :to="`/user/${user.id}`"> <!-- Lien vers le profil utilisateur -->
                      {{ user.pseudo }} {{ user.email }}  <!-- Affiche le pseudo -->

                  </router-link>
              </li>
          </ul>
          <p v-else-if="searchQuery.length >= 2 && !searchResults.length">
              Aucun utilisateur trouvé
          </p>
      </div>
  </div>
</template>

<script>
export default {
  data() {
      return {
          searchQuery: '', // La requête de recherche
          searchResults: [], // Les résultats de la recherche
      };
  },
  methods: {
      // Méthode pour rechercher des utilisateurs
      async searchUsers() {
          // Ne lancer la recherche que si la saisie fait au moins 2 caractères
          if (this.searchQuery.length < 2) {
              this.searchResults = []; // Réinitialiser les résultats si la recherche est inférieure à 2 caractères
              return;
          }

          console.log('Searching for users with query:', this.searchQuery); // Log de la requête

          try {
              const response = await fetch(`http://localhost:3000/api/users?search=${this.searchQuery}`, {
                  method: 'GET',
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json',
                  },
              });

              if (!response.ok) {
                  throw new Error('Erreur lors de la recherche des utilisateurs');
              }

              const data = await response.json();
              console.log('Users found:', data); // Log des résultats
              this.searchResults = data; // Stocker les résultats de la recherche
          } catch (error) {
              console.error('Erreur lors de la recherche des utilisateurs:', error);
          }
      },
  },
};
</script>

<style scoped>
/* Vous pouvez ajouter des styles ici pour améliorer la présentation */
.profile-page {
  padding: 20px;
}

.users-section {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 10px;
}
</style>
