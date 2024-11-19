<template>
    <div class="carousel-favoris">
      <h2>Liste des Films Favoris</h2>
      <div v-if="movies.length">
        <carousel
        :items-to-show="computedItemsToShow"
  :breakpoints="responsiveBreakpoints"
  :wrap-around="wrapAround"
        >
          <slide v-for="movie in movies" :key="movie.tmdbId">
            <router-link :to="{ name: 'MovieDetails', params: { id: movie.tmdbId } }">
              <img v-if="movie.poster_path" :src="getPosterUrl(movie.poster_path)" alt="Movie Poster" class="carousel-img" />
              <h3>{{ movie.title }}</h3>
            </router-link>
          </slide>
          <template #addons>
            <Navigation />
          </template>
        </carousel>
      </div>
      <div v-else>
        <p>Aucun film favori trouvé.</p>
      </div>
    </div>
  </template>
  
<script>
import { fetchMovieDetails } from '@/services/tmdbService';
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel'; // Importer le carrousel et les slides
import 'vue3-carousel/dist/carousel.css';


export default {
    name: 'FavoriteMovies',
    data() {
        return {
            movies: [],
        };
    },
    components: {
    Carousel,
    Slide,
    Navigation,
    Pagination,
  },
  computed: {
        computedItemsToShow() {
  const maxItemsToShow = 7;
  return this.movies ? Math.min(this.movies.length, maxItemsToShow) : 1;
},
  responsiveBreakpoints() {
    // Calcul des breakpoints en fonction du nombre de films disponibles
    return {
      1200: { itemsToShow: this.computedItemsToShow },
      1024: { itemsToShow: this.computedItemsToShow },
      768: { itemsToShow: this.computedItemsToShow },
      576: { itemsToShow: Math.min(this.movies.length, 4) },
      0: { itemsToShow: Math.min(this.movies.length, 1) },
    };
  },
  wrapAround() {
    // Désactiver le wrap-around s'il y a moins d'éléments que le nombre à afficher
    return this.movies.length > this.computedItemsToShow;
  },
},

    methods: {
        async fetchMovies() {
            try {
                const token = localStorage.getItem('token'); // Récupérez le token stocké
                const response = await fetch('http://localhost:3000/api/movies', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Inclure le token dans l'en-tête
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const moviesData = await response.json(); // Récupérez les films
                this.movies = await Promise.all(moviesData.map(async (movie) => {
                    // Récupérer les détails du film à partir de TMDB
                    const movieDetails = await fetchMovieDetails(movie.tmdbId);
                    return {
                        ...movieDetails, // Ajoutez les détails du film
                        tmdbId: movie.tmdbId // Incluez l'ID TMDB pour l'affichage
                    };
                }));

            } catch (error) {
                console.error('Error fetching movies:', error); // Gérer les erreurs
            }
        },

        getPosterUrl(path) {
            return `https://image.tmdb.org/t/p/w500${path}`;
        },
    },
    mounted() {
        this.fetchMovies(); // Appeler fetchMovies lorsque le composant est monté
        window.addEventListener('resize', this.handleResize);

    },
    beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style>

.carousel-favoris h2 {
    margin-bottom: 50px;
}

.carousel-img {
  width: 100%; /* Pour s'assurer que les images s'adaptent au carrousel */
  height: auto; /* Maintient le rapport d'aspect des images */
  border-radius: 7px;
}

.carousel__slide {
  align-items: normal;
}

.carousel-favoris .carousel__slide {
  margin-right: 15px;
}

.carousel__prev {
  left: -50px;
}

.carousel__next {
  right: -50px;
}
.carousel-favoris .carousel__prev, .carousel__next {
  color: turquoise;
}

</style>
