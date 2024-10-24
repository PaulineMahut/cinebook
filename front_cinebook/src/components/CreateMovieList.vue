<template>
    <div>
      <h2>Créer une Liste de Films</h2>
      <form @submit.prevent="createMovieList">
        <div>
          <label for="name">Nom de la Liste:</label>
          <input type="text" v-model="name" required />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea v-model="description" required></textarea>
        </div>
        <button type="submit">Créer la Liste</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        name: '',
        description: '',
      };
    },
    methods: {
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
          // Réinitialiser le formulaire ou rediriger l'utilisateur
          this.name = '';
          this.description = '';
        } catch (error) {
          console.error('Erreur lors de la création de la liste de films:', error);
          alert(`Failed to create movie list: ${error.message}`);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style pour le formulaire de création de liste de films */
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