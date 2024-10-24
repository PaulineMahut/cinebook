<template>
    <div>
      <h2>Mes Listes de Films</h2>
      <ul v-if="movieLists.length">
        <li v-for="list in movieLists" :key="list.id">
          <router-link :to="{ name: 'MovieListDetails', params: { id: list.id } }">{{ list.name }}</router-link>
        </li>
      </ul>
      <p v-else>Vous n'avez créé aucune liste de films.</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        movieLists: [],
      };
    },
    async mounted() {
      await this.loadMovieLists();
    },
    methods: {
      async loadMovieLists() {
        const token = localStorage.getItem('token');
  
        try {
          const response = await fetch('http://localhost:3000/api/movie-lists', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
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
    },
  };
  </script>
  
  <style scoped>
  /* Style pour la liste des listes de films */
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    margin: 5px 0;
  }
  
  a {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }
  </style>