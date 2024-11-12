<template>
  <div class="movie-list-details-container">
    <h2>Détails de la Liste de Films</h2>
    <div v-if="movieList" class="movie-list-details-card">
      <h3>{{ movieList.name }}</h3>
      <p>{{ movieList.description }}</p>
      <h4>Films</h4>
      <ul>
        <li v-for="item in movieList.items" :key="item.id" class="movie-item">
          <img v-if="posterCache[item.tmdbId]" :src="posterCache[item.tmdbId]" alt="Affiche du film" class="movie-poster" />
          <span>{{ item.title }}</span>
          <button @click="removeMovieFromList(item.id)" class="btn-remove">Retirer</button>
        </li>
      </ul>
      <h4>Ajouter un Film</h4>
      <SearchBar @movieSelected="addMovieToList" />
      <div v-if="isCreator" class="creator-options">
        <h4>Partager la Liste</h4>
        <select v-model="selectedGroupId">
          <option disabled value="">Sélectionnez un groupe</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
        </select>
        <button @click="shareListWithGroup" :disabled="!selectedGroupId" class="btn-share">Partager</button>
        <h4>Lancer une session de vote</h4>
        <button @click="goToCreateVotingSession" class="btn-vote">Lancer une session de vote</button>
      </div>
    </div>
    <p v-else>Chargement des détails de la liste de films...</p>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';
import { fetchMovieDetails } from '@/services/tmdbService'; // Importez la fonction fetchMovieDetails

export default {
  props: ['id'],
  components: {
    SearchBar,
  },
  data() {
    return {
      movieList: null,
      posterCache: {}, // Cache pour les affiches des films
      groups: [], // Liste des groupes de l'utilisateur
      selectedGroupId: '', // ID du groupe sélectionné pour le partage
      isCreator: false, // Indicateur pour savoir si l'utilisateur est le créateur de la liste
    };
  },
  async mounted() {
    await this.loadMovieListDetails();
    await this.loadUserGroups(); // Charger les groupes de l'utilisateur
    
    if (this.movieList && this.movieList.items) {
      const posterPromises = this.movieList.items.map(item => this.getPosterUrl(item.tmdbId));
      await Promise.all(posterPromises);  // Attend que toutes les affiches soient récupérées
    }
  },
  methods: {
    async loadMovieListDetails() {
      const token = localStorage.getItem('token');
      console.log(`Fetching details for movie list with ID: ${this.id}`);

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.movieList = await response.json();
          console.log('Movie list details:', this.movieList);

          // Vérifiez si l'utilisateur actuel est le créateur de la liste
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          this.isCreator = this.movieList.user.id === userId;
        } else {
          console.error('Erreur lors de la récupération des détails de la liste de films');
        }
      } catch (error) {
        console.error('Erreur de récupération des détails de la liste de films:', error);
      }
    },
    async loadUserGroups() {
      const token = localStorage.getItem('token');
      console.log('Fetching user groups');

      try {
        const response = await fetch('http://localhost:3000/api/user/groups', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.groups = await response.json();
          console.log('User groups:', this.groups);
        } else {
          console.error('Erreur lors de la récupération des groupes de l\'utilisateur');
        }
      } catch (error) {
        console.error('Erreur de récupération des groupes de l\'utilisateur:', error);
      }
    },
    async shareListWithGroup() {
      const token = localStorage.getItem('token');
      console.log(`Sharing list with group ID: ${this.selectedGroupId}`);

      if (!this.selectedGroupId) {
        console.error('Aucun groupe sélectionné');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/lists/${this.id}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            groupId: this.selectedGroupId,
          }),
        });

        if (response.ok) {
          console.log('Liste partagée avec succès');
        } else {
          console.error('Erreur lors du partage de la liste');
        }
      } catch (error) {
        console.error('Erreur lors du partage de la liste:', error);
      }
    },
    async addMovieToList(movie) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: movie.title,
            overview: movie.overview,
            voteAverage: movie.vote_average,
            tmdbId: movie.id,
          }),
        });

        if (response.ok) {
          const newItem = await response.json();
          if (!this.movieList.items) {
            this.movieList.items = [];
          }
          this.movieList.items.push(newItem);
        } else {
          console.error('Erreur lors de l\'ajout du film à la liste');
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout du film à la liste:', error);
      }
    },
    async removeMovieFromList(itemId) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.movieList.items = this.movieList.items.filter(item => item.id !== itemId);
        } else {
          console.error('Erreur lors de la suppression du film de la liste');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du film de la liste:', error);
      }
    },
    async getPosterUrl(tmdbId) {
      // Si le poster est déjà en cache, on l'utilise
      if (this.posterCache[tmdbId]) {
        return this.posterCache[tmdbId];
      }

      try {
        const data = await fetchMovieDetails(tmdbId); // Appel à l'API TMDb
        const posterUrl = `https://image.tmdb.org/t/p/w200${data.poster_path}`;
        
        // On stocke l'URL de l'affiche dans le cache pour éviter les appels répétés
        this.posterCache[tmdbId] = posterUrl;
        return posterUrl;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'affiche du film:', error);
        return ''; // En cas d'erreur, on retourne une chaîne vide
      }
    },
    goToCreateVotingSession() {
      this.$router.push({ name: 'create-voting-session', query: { movieListId: this.id } });
    },
  },
};
</script>

<style scoped>
/* Style pour la page de détails de la liste de films */
.movie-list-details-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #343a40;
  margin-bottom: 20px;
}

.movie-list-details-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #343a40;
  margin-bottom: 10px;
}

p {
  color: #6c757d;
  margin-bottom: 20px;
}

h4 {
  color: #495057;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

.movie-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.movie-poster {
  width: 100px;
  height: auto;
  margin-right: 10px;
}

.btn-remove {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: auto;
}

.btn-remove:hover {
  background-color: #c82333;
}

.creator-options {
  margin-top: 20px;
}

select {
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  margin-right: 10px;
  background-color: #ffffff;
  color: #495057;
}

.btn-share,
.btn-vote {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.btn-share:hover,
.btn-vote:hover {
  background-color: #0056b3;
}
</style>