<template>
    <div>
      <h1>Lancer une session de vote</h1>
      <form @submit.prevent="createVotingSession">
        <div>
          <label for="movieListId">Liste de films</label>
          <select v-model="movieListId" required>
            <option v-for="list in movieLists" :key="list.id" :value="list.id">{{ list.name }}</option>
          </select>
        </div>
        <div>
          <label for="description">Description</label>
          <textarea v-model="description" required></textarea>
        </div>
        <div>
          <label for="endTime">Date de fin</label>
          <input type="datetime-local" v-model="endTime" required />
        </div>
        <button type="submit">Lancer le vote</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        movieLists: [],
        movieListId: null,
        description: '',
        endTime: ''
      };
    },
    async mounted() {
      await this.loadMovieLists();
      const movieListId = this.$route.query.movieListId;
      if (movieListId) {
        this.movieListId = parseInt(movieListId);
      }
    },
    methods: {
      async loadMovieLists() {
        try {
          const response = await fetch('http://localhost:3000/api/movie-lists', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            this.movieLists = await response.json();
          } else {
            console.error('Erreur lors de la récupération des listes de films');
          }
        } catch (error) {
          console.error('Erreur de récupération des listes de films:', error);
        }
      },
      async createVotingSession() {
        try {
          const response = await fetch('http://localhost:3000/api/voting-sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              movieListId: this.movieListId,
              description: this.description,
              endTime: this.endTime,
            }),
          });
          if (response.ok) {
            const result = await response.json();
            alert('Session de vote créée avec succès');
            this.$router.push(`/voting-sessions/${result.id}`);
          } else {
            const errorData = await response.json();
            console.error('Erreur lors de la création de la session de vote:', errorData.error);
          }
        } catch (error) {
          console.error('Erreur lors de la création de la session de vote:', error);
        }
      },
    },
  };
  </script>