<!-- <template>
    <div>
      <input v-model="query" @keyup.enter="searchMovies" placeholder="Search for movies..." />
      <button @click="searchMovies">Search</button>
      <div v-if="errorMessage">{{ errorMessage }}</div>
      <ul v-if="movies.length">
        <li v-for="movie in movies" :key="movie.id">
          {{ movie.title }} ({{ movie.release_date }})
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { fetchMovies } from '@/services/tmdbService';
  
  export default {
    data() {
      return {
        query: '',
        movies: [],
        errorMessage: '',
      };
    },
    methods: {
      async searchMovies() {
        try {
          this.errorMessage = '';
          this.movies = await fetchMovies(this.query);
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
    },
  };
  </script> -->