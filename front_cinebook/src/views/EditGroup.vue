<template>
    <div class="edit-group-container">
      <h2>Modifier le Groupe</h2>
      <form @submit.prevent="updateGroup">
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
        <button type="submit" class="btn-submit">Enregistrer les modifications</button>
      </form>
      <div v-if="notificationMessage" class="notification">
        {{ notificationMessage }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['id'],
    data() {
      return {
        group: {
          name: '',
          description: '',
          members: [],
        },
        coverPhoto: null,
        friends: [], // Liste des amis récupérés
        selectedMembers: [], // Membres sélectionnés à ajouter au groupe
        notificationMessage: '',
      };
    },
    async mounted() {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
  
      await this.loadGroupDetails();
      await this.fetchFriends();
  
      // Vérifiez si l'utilisateur est bien le créateur
      if (this.group.creatorId !== userId) {
        console.error('Accès refusé : Vous n\'êtes pas le créateur du groupe.');
        this.$router.push({ name: 'GroupDetails', params: { id: this.id } });
      }
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
            this.selectedMembers = this.group.members.map(member => member.user.id); // Pré-sélectionner les membres existants
          } else {
            console.error('Erreur lors de la récupération des détails du groupe');
          }
        } catch (error) {
          console.error('Erreur de récupération des détails du groupe:', error);
        }
      },
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
        this.coverPhoto = event.target.files[0];
      },
      async updateGroup() {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', this.group.name);
        formData.append('description', this.group.description);
        formData.append('members', JSON.stringify(this.selectedMembers));
        if (this.coverPhoto) {
          formData.append('coverPhoto', this.coverPhoto);
        }
  
        try {
          const response = await fetch(`http://localhost:3000/api/groups/${this.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          if (response.ok) {
            this.notificationMessage = 'Groupe mis à jour avec succès';
            this.$router.push({ name: 'GroupDetails', params: { id: this.id } });
          } else {
            console.error('Erreur lors de la mise à jour du groupe');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour du groupe:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .edit-group-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .btn-submit {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-submit:hover {
    background-color: #0056b3;
  }
  
  .notification {
    margin-top: 20px;
    padding: 10px;
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
  }
  </style>