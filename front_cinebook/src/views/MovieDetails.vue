<template>
  <!-- <div v-if="movie">
    <h1>{{ movie.title }}</h1>
    <img :src="getPosterUrl(movie.poster_path)" :alt="movie.title" />
    <p>{{ movie.overview }}</p>
    <p>Release Date: {{ movie.release_date }}</p>
    <p>Rating: {{ movie.vote_average }}</p>
    <button @click="toggleFavorite">
      {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
    </button>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div> -->
</template>

<script>
// import { fetchMovieDetails, addFavoris, removeFavoris, getFavoris } from '@/services/tmdbService';

// export default {
//   data() {
//     return {
//       movie: null,
//       errorMessage: '',
//       isFavorite: false,
//       favoriId: null,
//     };
//   },
//   methods: {
//     async loadMovieDetails() {
//       try {
//         const movieId = this.$route.params.id;
//         this.movie = await fetchMovieDetails(movieId);
//         const favoris = await getFavoris();
//         const favori = favoris.find(fav => fav.movieId === this.movie.id);
//         if (favori) {
//           this.isFavorite = true;
//           this.favoriId = favori.id;
//         }
//       } catch (error) {
//         this.errorMessage = error.message;
//       }
//     },
//     async toggleFavorite() {
//     try {
//         if (this.isFavorite) {
//             await removeFavoris(this.favoriId);
//             this.isFavorite = false;
//             this.favoriId = null;
//         } else {
//             if (!this.movie.id || !this.movie.title) {
//                 throw new Error('Movie details are incomplete');
//             }
//             const favori = await addFavoris({
//                 id: this.movie.id,        // Assurez-vous de bien passer l'ID
//                 title: this.movie.title,
//                 poster_path: this.movie.poster_path
//             });
//             this.isFavorite = true;
//             this.favoriId = favori.id;
//         }
//     } catch (error) {
//         this.errorMessage = error.message;
//     }
// },

//     getPosterUrl(path) {
//       return `https://image.tmdb.org/t/p/w500${path}`;
//     },
//   },
//   mounted() {
//     this.loadMovieDetails();
//   },
// };
</script> 