<template>
  <div>
    <div v-if="notificationMessage" :class="notificationClass">
      {{ notificationMessage }}
      <button @click="clearNotification" class="close-btn">&times;</button>
      <router-link v-if="createdListId" :to="{ name: 'MovieListDetails', params: { id: createdListId } }">
        Voir la liste
      </router-link>
    </div>
    <div id="create-movie-list">
      <h2>Créer une Liste de Films</h2>
      <form @submit.prevent="createMovieList">
        <div class="form-group">
          <label for="name">Nom de la Liste:</label>
          <input type="text" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea v-model="description" required></textarea>
        </div>
        <button type="submit" class="btn-submit">Créer la Liste</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      name: '',
      description: '',
      createdListId: null, // Ajoutez cette ligne pour stocker l'ID de la liste créée
    };
  },
  computed: {
    ...mapState(['notificationMessage']),
    notificationClass() {
      return this.notificationMessage.includes('succès') ? 'notification-success' : 'notification-error';
    },
  },
  methods: {
    ...mapActions(['setNotificationMessage', 'clearNotificationMessage']),
    async createMovieList() {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:3000/api/movie-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: this.name,
            description: this.description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur lors de la création de la liste de films:', errorData);
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Liste de films créée:', data);
        this.createdListId = data.id; // Stockez l'ID de la liste créée
        this.setNotificationMessage('Liste de films créée avec succès');
        // Réinitialiser le formulaire ou rediriger l'utilisateur
        this.name = '';
        this.description = '';
      } catch (error) {
        console.error('Erreur lors de la création de la liste de films:', error);
        this.setNotificationMessage(`Failed to create movie list: ${error.message}`);
      }
    },
    clearNotification() {
      this.clearNotificationMessage();
    },
  },
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

#create-movie-list {
  max-width: 600px;
  width: 100%;
  margin: 0 auto; /* Centre horizontalement */
  margin-top: 50px;
  padding: 20px;
  background-color: #343a40;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Utiliser toute la hauteur de la page */
  background-color: #f0f2f5;
}

h2 {
  text-align: center;
  color: white;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: white;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  background-color: #ffffff1f;
  border-radius: 5px;
  box-sizing: border-box;
}

.btn-submit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
}

.btn-submit:hover {
  background-color: #0056b3;
}

</style>