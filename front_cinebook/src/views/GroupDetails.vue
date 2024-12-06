<template>
  <div class="groupdetail-container">
    <div v-if="group">
      <div>
        <h2>Groupe {{ group.name }}</h2>
        <p>{{ group.description }}</p>
        <p>Créé par : {{ group.creator.pseudo }}</p> <!-- Affichez le nom du créateur -->
        <button v-if="isCreator" @click="goToEditGroup" class="edit-button">Modifier</button>
        <button v-if="isCreator" @click="deleteGroup" class="delete-button">Supprimer</button> <!-- Bouton Supprimer -->
      </div>
      <div class="members-container">
        <h4>Membres</h4>
        <div class="groupdetail-members">
          <div v-for="member in group.members" :key="member.user.id" class="member-item">
            <router-link :to="{ name: 'UserProfile', params: { id: member.user.id } }">
              <img :src="getProfilePictureUrl(member.user.profilePicture)" alt="Profile Picture" class="profile-picture"/>
              <div>{{ member.user.pseudo }}</div>
              <div>{{ member.user.email }}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <p v-else>Chargement des détails du groupe...</p>
  </div>
</template>
<script>
export default {
  props: ['id'],
  data() {
    return {
      group: null,
      isCreator: false,
    };
  },
  async mounted() {
    await this.loadGroupDetails();
  },
  methods: {
    async loadGroupDetails() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/groups/${this.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          this.group = await response.json();
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          this.isCreator = this.group.creatorId === userId; // Définir isCreator
        } else {
          console.error('Erreur lors de la récupération des détails du groupe');
        }
      } catch (error) {
        console.error('Erreur de récupération des détails du groupe:', error);
      }
    },
    getProfilePictureUrl(path) {
      if (!path) {
        return 'http://localhost:3000/images/user_defaut.png'; // Chemin de l'image par défaut
      }
      if (path.startsWith('/images/')) {
        return `http://localhost:3000${path}`;
      } else if (path.startsWith('/uploads/')) {
        return `http://localhost:3000${path}`;
      } else {
        return `http://localhost:3000/uploads/${path}`;
      }
    },
    goToEditGroup() {
      this.$router.push({ name: 'EditGroup', params: { id: this.group.id } });
    },
    async deleteGroup() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/groups/${this.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          this.$router.push({ name: 'Home' }); // Rediriger vers la page d'accueil après la suppression
        } else {
          console.error('Erreur lors de la suppression du groupe');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du groupe:', error);
      }
    },
  },
};
</script>

<style scoped>
body, html {
  height: 100%;
  margin: 0;
}

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.groupdetail-container {
  margin-top: 100px;
  background-color: #343a40;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

h2, h3, h4, p {
  color: white;
}

.groupdetail-members {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.members-container {
  margin-top: 50px;
}

.members-container h4 {
  margin-bottom: 20px;
}

.edit-button, .delete-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.edit-button:hover, .delete-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
}

.delete-button:hover {
  background-color: #c82333;
}
</style>