<template>
  <div id="create-group">
    <h2>Créer un Groupe</h2>
    <form @submit.prevent="createGroup">
      <div class="form-group">
        <label for="name">Nom du Groupe:</label>
        <input type="text" v-model="group.name" required />
      </div>
      <div class="form-group">
        <label for="description">Description:</label>
        <textarea v-model="group.description" required></textarea>
      </div>
      <div class="form-group">
        <label for="coverPhoto">Photo de Couverture:</label>
        <input type="file" @change="onFileChange" />
      </div>
      <div class="form-group">
        <label>Membres:</label>
        <ul>
          <li v-for="friend in friends" :key="friend.id">
            <input type="checkbox" :value="friend.id" v-model="selectedMembers" />
            {{ friend.pseudo }} ({{ friend.email }})
          </li>
        </ul>
        <p v-if="!friends.length">Aucun ami trouvé.</p>
      </div>
      <button type="submit" class="btn-submit">Créer le Groupe</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'GroupForm',
  data() {
    return {
      group: {
        name: '',
        description: '',
      },
      coverPhoto: null,
      friends: [], // Liste des amis récupérés
      selectedMembers: [], // Membres sélectionnés à ajouter au groupe
    };
  },
  async mounted() {
    await this.fetchFriends();
  },
  methods: {
    async fetchFriends() {
      const token = localStorage.getItem('token'); // Récupérer le token d'authentification

      try {
        const response = await fetch('http://localhost:3000/api/friends', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json(); // Récupérer les données d'erreur
          console.error('Erreur lors de la récupération des amis:', errorData);
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const friendsData = await response.json();
        this.friends = friendsData; // Charger la liste d'amis
      } catch (error) {
        console.error('Erreur de récupération de la liste d\'amis:', error);
        alert(`Failed to fetch friends: ${error.message}`); // Alerte l'utilisateur
      }
    },
    onFileChange(event) {
      this.coverPhoto = event.target.files[0]; // Ajoutez cette ligne
    },
    async createGroup() {
      const token = localStorage.getItem('token'); // Récupérer le token d'authentification
      const formData = new FormData();
      formData.append('name', this.group.name);
      formData.append('description', this.group.description);
      formData.append('members', JSON.stringify(this.selectedMembers));
      if (this.coverPhoto) {
        formData.append('coverPhoto', this.coverPhoto); // Ajoutez cette ligne
      }

      try {
        const response = await fetch('http://localhost:3000/api/groups', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur lors de la création du groupe:', errorData);
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Groupe créé:', data);
        // Réinitialiser le formulaire ou rediriger l'utilisateur
        this.group.name = '';
        this.group.description = '';
        this.selectedMembers = [];
        this.coverPhoto = null;
      } catch (error) {
        console.error('Erreur lors de la création du groupe:', error);
        alert(`Failed to create group: ${error.message}`); // Alerte l'utilisateur
      }
    },
  },
};
</script>

<style scoped>
/* Style pour le formulaire de création de groupe */
#create-group {
  max-width: 600px;
  margin: auto;
  background-color: #343a40;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 50px;
}

h2 {
  text-align: center;
  color: white;
}

form {
  display: flex;
  flex-direction: column;
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
textarea,
input[type="file"] {
  width: 100%;
  padding: 10px;
  background-color: #ffffff1f;
  border-radius: 5px;
  box-sizing: border-box;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
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