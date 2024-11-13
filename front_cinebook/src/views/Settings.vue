<template>
  <div class="settings-container-page">
    <div v-if="notificationMessage" :class="notificationClass">
      {{ notificationMessage }}
      <button @click="clearNotification" class="close-btn">&times;</button>
    </div>
    <div class="settings-container">
      <h2>Paramètres du Profil</h2>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="pseudo">Pseudo</label>
          <input type="text" id="pseudo" v-model="pseudo" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" />
        </div>
        <div class="form-group">
          <label for="profilePicture">Photo de Profil</label>
          <input type="file" id="profilePicture" @change="onFileChange" />
        </div>
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      pseudo: '',
      email: '',
      profilePicture: null,
      currentProfilePictureUrl: '', // Ajoutez cette ligne pour stocker l'URL de la photo de profil actuelle
    };
  },
  computed: {
    ...mapState(['userProfile', 'notificationMessage']),
    notificationClass() {
      return this.notificationMessage.includes('succès') ? 'notification-success' : 'notification-error';
    },
  },
  methods: {
    ...mapActions(['updateUserProfile', 'clearNotificationMessage', 'fetchUserProfile']),
    onFileChange(event) {
      this.profilePicture = event.target.files[0];
    },
    async updateProfile() {
      const formData = new FormData();
      formData.append('pseudo', this.pseudo);
      formData.append('email', this.email);
      if (this.profilePicture) {
        formData.append('profilePicture', this.profilePicture);
      } else if (this.currentProfilePictureUrl) {
        formData.append('currentProfilePictureUrl', this.currentProfilePictureUrl); // Incluez l'URL de la photo de profil actuelle
      }
      await this.updateUserProfile(formData);
    },
    clearNotification() {
      this.clearNotificationMessage();
    },
    async loadUserProfile() {
      await this.fetchUserProfile();
      if (this.userProfile) {
        this.pseudo = this.userProfile.pseudo;
        this.email = this.userProfile.email;
        this.currentProfilePictureUrl = this.userProfile.profilePicture; // Stockez l'URL de la photo de profil actuelle
      }
    },
  },
  async mounted() {
    await this.loadUserProfile();
  },
};
</script>

<style scoped>

.settings-container-page {
  margin-top: 50px;
}

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: rgba(3, 8, 27, 0.3);
  border-radius: 10px;
}

.form-group {
  margin-bottom: 30px; /* Augmenter la marge inférieure pour plus d'espacement */
}

.form-group label {
  display: block;
  margin-bottom: 10px; /* Augmenter la marge inférieure pour plus d'espacement */
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px; /* Ajouter une marge inférieure pour plus d'espacement */
  background-color: #222831;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px; /* Ajouter une marge supérieure pour plus d'espacement */
}

button:hover {
  background-color: #0056b3;
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
</style>