<template>
  <div class="carrousel-recom">
    <h2>Recommandés pour vous</h2>
    <div v-if="recommendedMovies.length > 0">
      <carousel :items-to-show="7"
      :breakpoints="responsiveBreakpoints"
      :wrap-around="wrapAround"
      :navigation-enabled="true">
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
        responsiveBreakpoints: {
        1200: { itemsToShow: 7 }, // Pour les écrans larges
        1024: { itemsToShow: 6 }, // Pour les tablettes en mode paysage
        768: { itemsToShow: 6 },  // Pour les tablettes en mode portrait
        576: { itemsToShow: 4 },  // Pour les petits écrans de smartphone
        0: { itemsToShow: 1 },    // Pour les très petits écrans
      },
      };
    },
    computed: {
    isSmallScreen() {
      return window.innerWidth < 576;
    },
    wrapAround() {
      return !this.isSmallScreen;
    },
  },
    methods: {
      handleResize() {
      this.$forceUpdate(); // Force la mise à jour du composant pour recalculer les propriétés calculées
    },
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
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  };
  </script>
  <style>

  .carousel-img {
    width: 100%;
    height: auto;
    border-radius: 7px;
  }
  .carousel__slide {
  align-items: normal;
}
  .carrousel-recom h2 {
    margin-top: 50px;
    margin-bottom: 50px;
  }

  .carrousel-recom .carousel__slide {
  margin-right: 15px;
}

  .carousel__prev {
  left: -50px;
}

.carousel__next {
  right: -50px;
}
  
  .carrousel-recom .carousel__slide {
    margin-right: 15px;
  }
  
  .carousel__prev, .carousel__next {
    color: turquoise;
  }

  /* Media query pour les écrans en dessous de 576 pixels */
@media (max-width: 576px) {
  .carrousel-recom .carousel__slide {
    margin-right: 0; /* Supprime le margin-right pour les petits écrans */
  }
}
  </style>
  