<template>
  <div>
    <h1>Search Movies</h1>

    <div>
      <input
        v-model="query"
        @keyup.enter="searchMovies"
        placeholder="Search for movies..."
      />
      <button @click="searchMovies">Search</button>

      <label for="genre-select">Select Genre:</label>
      <select id="genre-select" v-model="selectedGenreId" @change="filterMovies">
        <option value="">All Genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>

      <label for="year-select">Select Year:</label>
      <select id="year-select" v-model="selectedYear" @change="filterMovies">
        <option value="">All Years</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <div v-if="errorMessage">{{ errorMessage }}</div>
    
    <div v-if="filteredMovies.length">
      <carousel :items-to-show="5">
        <slide v-for="movie in filteredMovies" :key="movie.id">
          <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
            <img class="carousel-img" :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
            <h3>{{ movie.title }}</h3>
            <p>Release Date: {{ movie.release_date }}</p>
          </router-link>
        </slide>
        <template #addons>
          <Pagination />
          <Navigation />
        </template>
      </carousel>
    </div>
    <div v-else>
      <p>No movies found.</p>
    </div>
  </div>
</template>

<script>
import { fetchMoviesByGenre, fetchMovieGenres, fetchMovies } from '@/services/tmdbService';
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel';
import defaultImage from '@/assets/imgpardefaut.png';

export default {
  components: {
    Carousel,
    Slide,
    Navigation,
    Pagination,
  },
  data() {
    return {
      genres: [],
      selectedGenreId: null,
      selectedYear: '', // Ajoutez une propriété pour l'année sélectionnée
      query: '',
      movies: [],
      errorMessage: '',
      defaultImage: defaultImage,
      years: this.generateYears(), // Générer la liste des années
    };
  },
  computed: {
    filteredMovies() {
      return this.movies.filter(movie => {
        const matchesGenre = this.selectedGenreId ? movie.genre_ids.includes(this.selectedGenreId) : true;
        const matchesQuery = this.query ? movie.title.toLowerCase().includes(this.query.toLowerCase()) : true;
        const matchesYear = this.selectedYear ? new Date(movie.release_date).getFullYear() === Number(this.selectedYear) : true; // Filtrer par année
        return matchesGenre && matchesQuery && matchesYear;
      });
    },
  },
  methods: {
    async loadGenres() {
      try {
        this.genres = await fetchMovieGenres();
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    },
    
    async searchMovies() {
      try {
        this.errorMessage = '';
        this.movies = await fetchMovies(this.query);
        this.filterMovies(); // Appliquer le filtre après la recherche
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    filterMovies() {
      // Cette méthode n'a plus besoin d'appeler filteredMovies directement car elle est réactive
    },

    getPosterUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : this.defaultImage;
    },

    generateYears() {
      const currentYear = new Date().getFullYear();
      const startYear = 1900; // Définissez l'année de début souhaitée
      const years = [];
      for (let year = currentYear; year >= startYear; year--) {
        years.push(year);
      }
      return years;
    }
  },
  mounted() {
    this.loadGenres();
  },
};
</script>

<style scoped>
.carousel-img {
  width: 100%; /* Pour s'assurer que les images s'adaptent au carrousel */
  height: auto; /* Maintient le rapport d'aspect des images */
}

.carousel__slide {
  margin-right: 15px;
}

.carousel__prev,
.carousel__next {
  color: turquoise;
}
</style>
