<template>
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
#create-movie-list {
  max-width: 600px;
  margin: auto;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #343a40;
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
  color: #495057;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
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