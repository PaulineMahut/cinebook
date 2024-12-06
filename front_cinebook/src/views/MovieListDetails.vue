<template>
  <div class="page-container">
    <div class="movie-list-details-container">
      <div v-if="notificationMessage" :class="notificationClass">
        {{ notificationMessage }}
        <button @click="clearNotification" class="close-btn">&times;</button>
      </div>
      <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
      <div v-if="movieList" class="movie-list-details-card">
        <h2>Liste "{{ movieList.name }}" de <p v-if="movieList.user">{{ movieList.user.pseudo || movieList.user.email }}</p> </h2>
        <p class="list-description">{{ movieList.description }}</p>
        <div class="movies-container">
          <div v-for="item in movieList.items" :key="item.id" class="movie-item">
  <button v-if="isCreator" @click="removeMovieFromList(item.id)" class="btn-remove">&times;</button>
  <img v-if="posterCache[item.tmdbId]" :src="posterCache[item.tmdbId]" alt="Affiche du film" class="movie-poster" />
  <div class="movie-info">
    <h3>{{ item.title }}</h3>
  </div>
</div>
        </div>
        <SearchBar class="search-bar-movielist" @movieSelected="addMovieToList" />
        <div v-if="isCreator" class="creator-options">
          <select class="select-group" v-model="selectedGroupId">
            <option  disabled value="">Sélectionnez un groupe</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <button @click="shareListWithGroup" :disabled="!selectedGroupId" class="btn-share">Partager</button>
          <div class="button-container">
          <button @click="goToCreateVotingSession" class="btn-vote">Lancer une session de vote</button>
          <button @click="deleteMovieList" class="btn-delete">Supprimer la Liste</button>
        </div>
        </div>
      </div>
      <p v-else>Chargement des détails de la liste de films...</p>
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';
import { fetchMovieDetails } from '@/services/tmdbService';
import { mapState, mapActions } from 'vuex';
import { useToast } from 'vue-toastification';

export default {
  props: ['id'],
  components: {
    SearchBar,
  },
  data() {
    return {
      movieList: null,
      posterCache: {},
      groups: [],
      selectedGroupId: '',
      isCreator: false,
      canAddMovies: false,
      isShared: false, // Nouvelle propriété pour suivre l'état de partage
    };
  },
  computed: {
    ...mapState(['notificationMessage']),
    notificationClass() {
      return this.notificationMessage.includes('succès') ? 'notification-success' : 'notification-error';
    },
    ...mapState(['errorMessage']),

  },
  async mounted() {
    await this.loadMovieListDetails();
    await this.loadUserGroups();
    
    if (this.movieList && this.movieList.items) {
      const posterPromises = this.movieList.items.map(item => this.getPosterUrl(item.tmdbId));
      await Promise.all(posterPromises);
    }
  },
  methods: {
    ...mapActions(['clearErrorMessage']),
    ...mapActions(['clearNotificationMessage']),
    async loadMovieListDetails() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      this.movieList = await response.json();

      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      this.isCreator = this.movieList.user.id === userId;

      // Vérifiez si la liste est partagée
      const sharedResponse = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/shared`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (sharedResponse.ok) {
        const sharedData = await sharedResponse.json();
        this.isShared = sharedData.isShared;
      }
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
      const toast = useToast();
      const token = localStorage.getItem('token');
      console.log(`Sharing list with group ID: ${this.selectedGroupId}`);

      if (!this.selectedGroupId) {
        console.error('Aucun groupe sélectionné');
        toast.error('Aucun groupe sélectionné');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/share`, {
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
          this.isShared = true; // Mettre à jour l'état de partage
          toast.success('Liste partagée avec succès');
        } else if (response.status === 409) {
          const errorData = await response.json();
          toast.error('La liste est déjà partagée avec ce groupe');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error);
        }
      } catch (error) {
        console.error('Erreur lors du partage de la liste:', error);
        toast.error('Erreur lors du partage de la liste');
      }
    },
    async checkIfListIsShared(listId) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:3000/api/movie-lists/${listId}/shared`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.isShared;
    } else {
      console.error('Erreur lors de la vérification du partage de la liste');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du partage de la liste:', error);
    return false;
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
    async deleteMovieList() {
      const toast = useToast();
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast.success('Liste supprimée avec succès');
          this.$router.push({ name: 'Profile' }); // Redirigez vers la liste des films après suppression
        } else {
          console.error('Erreur lors de la suppression de la liste');
          toast.error('Erreur lors de la suppression de la liste');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la liste:', error);
        toast.error('Erreur lors de la suppression de la liste');
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
      if (this.posterCache[tmdbId]) {
        return this.posterCache[tmdbId];
      }

      try {
        const data = await fetchMovieDetails(tmdbId);
        const posterUrl = `https://image.tmdb.org/t/p/w200${data.poster_path}`;
        
        this.posterCache[tmdbId] = posterUrl;
        return posterUrl;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'affiche du film:', error);
        return '';
      }
    },
    async updateUserPermissions(userId, canAddMovies) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            canAddMovies,
          }),
        });

        if (response.ok) {
          console.log('Permissions mises à jour avec succès');
        } else {
          console.error('Erreur lors de la mise à jour des permissions');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des permissions:', error);
      }
    },
    goToCreateVotingSession() {
  if (!this.isShared) {
    this.$store.commit('setNotificationMessage', 'Il faut partager la liste avec un de vos groupes avant de pouvoir lancer un vote');
    return;
  }
  this.$router.push({ name: 'create-voting-session', query: { movieListId: this.id } });
},
    clearNotification() {
      this.clearNotificationMessage();
    },
  },
};
</script>

<style scoped>

.error-message {
  color: red;
  margin-top: 10px;
}

body, html {
  height: 100%;
  margin: 0;
}

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}

.movie-list-details-container {
  max-width: max-content;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.select-group {
  border-radius: 15px;
  background-color: rgba(98, 104, 111, 0.3);
  color: white;
  border: none;
}

h2 {
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

h3 {
  color: white;
  margin-bottom: 10px;
}

.list-description {
  color: white;
  margin-bottom: 50px;
}
p {
  color: white;
  margin-bottom: 20px;
}

h4 {
  color: white;
  margin-bottom: 10px;
}

.btn-share {
  background-color: transparent !important;
  border: 1px solid #5DF6FF !important;
  border-radius: 13px !important ;
}

.btn-share:hover {
  background-color: #5DF6FF !important;
}

.btn-vote {
  background-color: transparent !important;
  border: 1px solid #5DF6FF !important;
  border-radius: 13px !important ;
}

.btn-vote:hover {
  background-color: #5DF6FF !important;
}

.btn-delete {
  background-color: #D06D6D !important;
  border-radius: 13px !important ;
}
.btn-delete:hover {
  background-color: #EC5A5A !important;
  border-radius: 13px !important ;
}

.movies-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.movie-item {
  position: relative; /* Ajoutez cette ligne */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(50% - 10px);
  margin-bottom: 20px;
}

.btn-remove {
  position: absolute; /* Ajoutez cette ligne */
  top: -12px; /* Ajustez la position selon vos besoins */
  right: 18px; /* Ajustez la position selon vos besoins */
  background-color: #03081B; /* Rendre le fond transparent */
  color: #2BA3E8; /* Couleur de la croix */
  border: none; /* Supprimer la bordure */
  font-size: 20px; /* Taille de la croix */
  cursor: pointer;
  padding: 0 5px 0 5px;
  border-radius: 100px;
}

.btn-remove:hover {
  color: darkred; /* Couleur de la croix au survol */
}

.movie-poster {
  width: 70%;
  height: auto;
  margin-bottom: 10px;
  border-radius: 10px;
}

.movie-info {
  text-align: center;
}

.search-bar-movielist {
  background-color: rgba(98, 104, 111, 0.3);
  border-radius: 20px;
  align-content: center;
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

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.btn-delete:hover {
  background-color: #c82333;
}

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

.creator-options .button-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}
</style>