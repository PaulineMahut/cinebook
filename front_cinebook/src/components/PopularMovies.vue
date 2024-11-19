<template>
  <div class="carrousel-popular">
    <h2>Films populaires</h2>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    
    <carousel
      :items-to-show="7"
      :breakpoints="responsiveBreakpoints"
      :wrap-around="wrapAround"
    >
      <slide v-for="movie in movies" :key="movie.id">
        <router-link :to="{ name: 'MovieDetails', params: { id: movie.id } }">
          <img class="carousel-img" :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
          <h3>{{ movie.title }}</h3>
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
      responsiveBreakpoints: {
        1200: { itemsToShow: 7 }, // Pour les écrans larges
        1024: { itemsToShow: 6 }, // Pour les tablettes en mode paysage
        768: { itemsToShow: 6 },  // Pour les tablettes en mode portrait
        576: { itemsToShow: 4 },
        // Pour les petits écrans de smartphone
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
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.$forceUpdate(); // Force la mise à jour du composant pour recalculer les propriétés calculées
    },
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
};
</script>

<style scoped>
/* Ajoutez des styles personnalisés si nécessaire */
.carousel-img {
  width: 100%; /* Pour s'assurer que les images s'adaptent au carrousel */
  height: auto; /* Maintient le rapport d'aspect des images */
  border-radius: 7px;
}

.carousel__slide {
  align-items: normal;
}

.carrousel-popular .carousel__slide {
  margin-right: 15px;
}

.carousel__prev {
  left: -50px;
}

.carousel__next {
  right: -50px;
}
.carrousel-popular .carousel__prev, .carousel__next {
  color: turquoise;
}

.carrousel-popular h2 {
  margin-bottom: 50px;
  margin-top: 50px;
}

/* Media query pour les écrans en dessous de 576 pixels */
@media (max-width: 576px) {
  .carrousel-popular {
    overflow: hidden; /* Supprime le débordement */
  }
}
</style>