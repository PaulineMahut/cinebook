<template>
  <div class="carrousel-random">
    <!-- Only display the genre's name if randomGenre is not null -->
    <h2 v-if="randomGenre">Film du genre "{{ randomGenre.name }}"</h2>
    <div v-if="errorMessage">{{ errorMessage }}</div>

    <!-- Carousel for movies -->
    <carousel v-if="movies.length" :items-to-show="7"
      :breakpoints="responsiveBreakpoints"
      :wrap-around="wrapAround">
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
  components: {
    Pagination,
    Carousel,
    Slide,
    Navigation,
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
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>

.carousel-img {
  width: 100%; /* Pour s'assurer que les images s'adaptent au carrousel */
  height: auto; /* Maintient le rapport d'aspect des images */
  border-radius: 7px;
}

.carousel__slide {
  align-items: normal;
}

.carrousel-random .carousel__slide {
  margin-right: 15px;
}

.carousel__prev {
  left: -50px;
}

.carousel__next {
  right: -50px;
}

.carrousel-random h2 {
  margin-top: 50px;
  margin-bottom: 50px;
}

.carrousel-popular .carousel__prev, .carousel__next {
  color: turquoise;
}
  @media (max-width: 576px) {

  .carrousel-random .carousel__slide {
    margin-right: 0;
  }

}
</style>
