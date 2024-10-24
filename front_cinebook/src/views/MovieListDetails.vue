<template>
  <div>
    <h2>Détails de la Liste de Films</h2>
    <div v-if="movieList">
      <h3>{{ movieList.name }}</h3>
      <p>{{ movieList.description }}</p>
      <h4>Films</h4>
      <ul>
        <li v-for="item in movieList.items" :key="item.id">
          {{ item.title }}
        </li>
      </ul>
      <h4>Ajouter un Film</h4>
      <SearchBar @movieSelected="addMovieToList" />
    </div>
    <p v-else>Chargement des détails de la liste de films...</p>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar.vue';

export default {
  props: ['id'],
  components: {
    SearchBar,
  },
  data() {
    return {
      movieList: null,
    };
  },
  async mounted() {
    await this.loadMovieListDetails();
  },
  methods: {
    async loadMovieListDetails() {
      const token = localStorage.getItem('token');
      console.log(`Fetching details for movie list with ID: ${this.id}`);

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.movieList = await response.json();
          console.log('Movie list details:', this.movieList);
        } else {
          console.error('Erreur lors de la récupération des détails de la liste de films');
        }
      } catch (error) {
        console.error('Erreur de récupération des détails de la liste de films:', error);
      }
    },
    async addMovieToList(movie) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3000/api/movie-lists/${this.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: movie.title,
            overview: movie.overview,
            voteAverage: movie.vote_average,
            tmdbId: movie.id,
          }),
        });

        if (response.ok) {
          const newItem = await response.json();
          if (!this.movieList.items) {
            this.movieList.items = [];
          }
          this.movieList.items.push(newItem);
        } else {
          console.error('Erreur lors de l\'ajout du film à la liste');
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout du film à la liste:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Style pour la page de détails de la liste de films */
</style>