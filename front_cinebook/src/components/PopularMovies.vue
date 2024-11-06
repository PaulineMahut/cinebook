<template>
  <div class="bloc-carrousel">
    <h2>Films populaires</h2>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    
    <carousel :items-to-show="5" >
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
import { defineComponent } from 'vue'
import { fetchPopularMovies } from '@/services/tmdbService';
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel'; // Importer le carrousel et les slides
import 'vue3-carousel/dist/carousel.css'

export default {
  components: {
    Pagination,
    Carousel,
    Slide,
    Navigation
  },
  data() {
    return {
      movies: [],
      errorMessage: '',
    };
  },
  methods: {
    async loadPopularMovies() {
      try {
        this.errorMessage = '';
        this.movies = await fetchPopularMovies();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    getPosterUrl(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  mounted() {
    this.loadPopularMovies();
  },
};
</script>

<style>
/* @import './node_modules/vue3-carousel/dist/carousel.css'; Assurez-vous que le chemin est correct */

/* Ajoutez des styles personnalisés si nécessaire */
.carousel-img {
  width: 100%; /* Pour s'assurer que les images s'adaptent au carrousel */
  height: auto; /* Maintient le rapport d'aspect des images */

}

.carousel__slide {
  margin-right: 15px;
}
.carousel__prev, .carousel__next {
  color: turquoise;
}
</style>
