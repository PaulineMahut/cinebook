<template>
  <div id="create-group">
    <h2>Créer un Groupe</h2>
    <form @submit.prevent="createGroup">
      <div>
        <label for="name">Nom du Groupe:</label>
        <input type="text" v-model="group.name" required />
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea v-model="group.description" required></textarea>
      </div>
      <div>
        <label>Membres:</label>
        <ul>
          <li v-for="friend in friends" :key="friend.id">
            <input type="checkbox" :value="friend.id" v-model="selectedMembers" />
            {{ friend.pseudo }} ({{ friend.email }})
          </li>
        </ul>
        <p v-if="!friends.length">Aucun ami trouvé.</p>
      </div>
      <button type="submit">Créer le Groupe</button>
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
    async createGroup() {
      const token = localStorage.getItem('token'); // Récupérer le token d'authentification

      try {
        const response = await fetch('http://localhost:3000/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: this.group.name,
            description: this.group.description,
            members: this.selectedMembers, // Passer les membres sélectionnés
          }),
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
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 10px;
}

button {
  margin-top: 20px;
}
</style>