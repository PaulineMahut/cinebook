<template>
  <div class="bloc-carrousel">
    <!-- Only display the genre's name if randomGenre is not null -->
    <h2 v-if="randomGenre">Film du genre "{{ randomGenre.name }}"</h2>
    <div v-if="errorMessage">{{ errorMessage }}</div>

    <!-- Carousel for movies -->
    <carousel v-if="movies.length" :items-to-show="5" :wrap-around="true">
      <slide v-for="movie in movies" :key="movie.id">
        <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
          <img class="carousel-img" :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
          <h3>{{ movie.title }}</h3>
          <!-- <p>{{ movie.release_date }}</p> -->
        </router-link>
      </slide>
      <template #addons>
        <Navigation />
      </template>
    </carousel>
  </div>
</template>

<script>
import { fetchMovieGenres, fetchMoviesByGenre } from '@/services/tmdbService';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';

export default {
  data() {
    return {
      movies: [],
      randomGenre: null,
      errorMessage: '',
    };
  },
  components: {
    Pagination,
    Carousel,
    Slide,
    Navigation,
  },
  methods: {
    async loadMoviesForRandomGenre() {
      try {
        this.errorMessage = '';
        const genres = await fetchMovieGenres(); // Fetch all genres
        if (genres && genres.length > 0) {
          const randomIndex = Math.floor(Math.random() * genres.length); // Choose a random genre
          this.randomGenre = genres[randomIndex]; // Save the selected genre
          this.movies = await fetchMoviesByGenre(this.randomGenre.id); // Fetch movies by the random genre
        } else {
          this.errorMessage = 'No genres found.';
        }
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  mounted() {
    this.loadMoviesForRandomGenre();
  },
};
</script>
