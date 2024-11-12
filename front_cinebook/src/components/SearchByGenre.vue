<template>
  <div>
    <h1>Movies by Genre</h1>

    <div>
      <label for="genre-select">Select Genre:</label>
      <select id="genre-select" v-model="selectedGenreId" @change="loadMoviesByGenre">
        <option value="">All Genres</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.id">
          {{ genre.name }}
        </option>
      </select>
    </div>

    <div v-if="movies.length" class="carrousel-search">
      <h2>Movies:</h2>
      <carousel :items-to-show="5">
        <slide v-for="movie in movies" :key="movie.id">
          <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
            <img class="carousel-img" :src="getPosterUrl(movie.poster_path) || defaultImage"  :alt="movie.title" />
            <h3>{{ movie.title }}</h3>
            <p>Release Date: {{ movie.release_date }}</p>
            <p>Rating: {{ movie.vote_average }}</p>
          </router-link>
        </slide>
        <template #addons>
          <Pagination />
          <Navigation />
        </template>
      </carousel>
    </div>

    <div v-else>
      <p>No movies found for this genre.</p>
    </div>
  </div>
</template>

<script>
import { fetchMoviesByGenre, fetchMovieGenres } from '@/services/tmdbService';
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
      movies: [],
      defaultImage: defaultImage, // chemin vers votre image par défaut

    };
  },
  methods: {
    async loadGenres() {
      try {
        this.genres = await fetchMovieGenres();
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    },

    async loadMoviesByGenre() {
      if (this.selectedGenreId) {
        try {
          this.movies = await fetchMoviesByGenre(this.selectedGenreId);
        } catch (error) {
          console.error('Failed to fetch movies:', error);
        }
      }
    },

    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
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
  height: auto;
}

.carousel__slide {
  margin-right: 15px;
}

.carousel__prev,
.carousel__next {
  color: turquoise;
}
</style>
