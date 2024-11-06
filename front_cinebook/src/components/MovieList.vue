<template>
  <div class="bloc-searchbar">
    <h3></h3>

    <div>

    <div class="search-bar">
      <input
        v-model="query"
        @keyup.enter="searchMovies"
        placeholder="Recherchez un film..."
      />

      <select v-model="selectedGenreId">
        <option value="">Genres</option> <!-- Valeur par défaut -->
        <option v-for="genre in genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>

      <select v-model="selectedYear">
        <option value="">Années</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <button @click="searchMovies"><i class="fas fa-search"></i></button>
    </div>

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
import { fetchMoviesByCriteria, fetchMovieGenres } from '@/services/tmdbService';
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
      selectedGenreId: '',
      selectedYear: '',
      query: '',
      movies: [],
      errorMessage: '',
      defaultImage: defaultImage,
      years: this.generateYears(),
    };
  },
  computed: {
    filteredMovies() {
      return this.movies;
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
        this.movies = await fetchMoviesByCriteria(this.selectedGenreId, this.selectedYear, this.query);
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    getPosterUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : this.defaultImage;
    },

    generateYears() {
      const currentYear = new Date().getFullYear();
      const startYear = 1900;
      const years = [];
      for (let year = currentYear; year >= startYear; year--) {
        years.push(year);
      }
      return years;
    },
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

select {
  background-color: #f0f0f000; /* Couleur de fond gris clair */
  color: #ffffff; /* Couleur du texte */
  border: 1px solid #ccc; /* Bordure */
  padding: 5px; /* Espacement interne */
  border-radius: 4px; /* Coins arrondis */
  border: none;
  outline: none; /* Supprimer la bordure active */

}

/* .bloc-searchbar {
  justify-content: space-around;
  display: grid;
} */

.search-bar input{
  outline: none; /* Supprimer la bordure active */

}
select option {
  background-color: #f0f0f0; /* Couleur de fond gris clair pour les options */
  color: #333; /* Couleur du texte pour les options */
}
</style>