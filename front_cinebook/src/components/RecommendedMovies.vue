<template>
  <div>
    <h1>Recommended Movies</h1>
    <div v-if="recommendedMovies.length > 0">
      <carousel :items-to-show="5">
        <slide v-for="movie in recommendedMovies" :key="movie.id">
          <router-link v-if="movie.id" :to="{ name: 'MovieDetails', params: { id: movie.id } }">
            <img class="carousel-img" :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
            <h3>{{ movie.title }}</h3>
          </router-link>
          <div v-else>
            <p>Film ID manquant pour {{ movie.title }}</p>
          </div>
        </slide>
        <template #addons>
          <Pagination />
          <Navigation />
        </template>
      </carousel>
    </div>
    <div v-else>
      <p>No recommendations available.</p>
    </div>
  </div>
</template>


  
  <script>
  import {
    fetchUserAddedMoviesWithGenres,
    fetchMoviesByGenre,
  } from '@/services/tmdbService'; // Assurez-vous que les chemins sont corrects
  import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel'; // Importer le carrousel et les slides

  export default {
    components: {
    Pagination,
    Carousel,
    Slide,
    Navigation
  },
    data() {
      return {
        recommendedMovies: [],
      };
    },
    methods: {
      async loadRecommendations() {
  try {
    console.log('Loading recommendations...');
    const userMovies = await fetchUserAddedMoviesWithGenres();
    console.log('User Movies:', userMovies);

    // Extraire les IDs de genre des films ajoutés par l'utilisateur
    const genreIds = userMovies.flatMap(movie => {
      if (movie.genres && Array.isArray(movie.genres)) {
        return movie.genres.map(genre => genre.id);
      }
      return [];
    });

    const uniqueGenreIds = [...new Set(genreIds)];
    console.log('Unique Genre IDs:', uniqueGenreIds);

    const moviePromises = uniqueGenreIds.map(id => fetchMoviesByGenre(id));
    const results = await Promise.all(moviePromises);

    const allRecommendedMovies = results.flat();
    console.log('All Recommended Movies:', allRecommendedMovies);

    this.recommendedMovies = allRecommendedMovies.filter(movie =>
      !userMovies.find(userMovie => userMovie.tmdbId === movie.id)
    );

    console.log('Filtered Recommended Movies:', this.recommendedMovies);

  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
},

  getPosterUrl(path) {
    return `https://image.tmdb.org/t/p/w500${path}`;
  },
},

    mounted() {
      this.loadRecommendations();
    },
  };
  </script>
  <style>
  @import './node_modules/vue3-carousel/dist/carousel.css'; /* Assurez-vous que le chemin est correct */
  
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
  