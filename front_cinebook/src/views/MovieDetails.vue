<template>
  <div class="movie-details-container" v-if="movie">
    <div class="background-image" :style="{ backgroundImage: `url(${getPosterUrl(movie.poster_path)})` }"></div>
    <div class="movie-details-content">
      <h1>{{ movie.title }}</h1>
      <div class="movie-info">
        <span>{{ movie.runtime }} min</span>
        <span v-for="(genre, index) in movie.genres" :key="genre.id">
          {{ genre.name }}<span v-if="index < movie.genres.length - 1">, </span>
        </span>
        <span>{{ movie.release_date.split('-')[0] }}</span>
      </div>
      <div class="movie-rating">
        <p>Rating: {{ movie.vote_average }}</p>
      </div>
      <div class="movie-overview">
        <p>{{ movie.overview }}</p>
      </div>
      <div class="movie-cast">
        <h2>Cast</h2>
        <div class="cast-list">
          <div v-for="actor in mainCast" :key="actor.id" class="cast-item">
            <img :src="getProfileUrl(actor.profile_path)" alt="Actor photo" />
            <p>{{ actor.name }}<br><small>as {{ actor.character }}</small></p>
          </div>
        </div>
      </div>
      <div class="user-reviews">
        <h2>User Reviews</h2>
        <ul>
          <li v-for="review in reviews" :key="review.id">
            <p><strong>{{ review.author }}</strong>: {{ review.content }}</p>
          </li>
        </ul>
      </div>
      <div class="similar-movies">
        <h2>Similar Movies</h2>
        <ul>
          <li v-for="similarMovie in limitedSimilarMovies" :key="similarMovie.id">
            <router-link :to="{ name: 'MovieDetails', params: { id: similarMovie.id } }">
              <img :src="getPosterUrl(similarMovie.poster_path)" :alt="similarMovie.title" />
              <p>{{ similarMovie.title }}</p>
            </router-link>
          </li>
        </ul>
      </div>
      <button @click="isMovieInDatabase ? removeMovieFromDatabase(movie.id) : addMovieToDatabase(movie.id)">
      {{ isMovieInDatabase ? 'Remove from Database' : 'Add to Database' }}
    </button>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { fetchMovieDetails, fetchSimilarMoviesD, fetchMovieCast, fetchMovieReviews } from '@/services/tmdbService';

export default {
  data() {
    return {
      movie: null,
      cast: [],
      reviews: [],
      similarMovies: [],
      errorMessage: '',
      isMovieInDatabase: false,
    };
  },
  computed: {
    mainCast() {
      return this.cast.slice(0, 7);
    },
    limitedSimilarMovies() {
      return this.similarMovies.slice(0, 3);
    },
  },
  methods: {
    async loadMovieDetails() {
      try {
        const movieId = this.$route.params.id;
        this.movie = await fetchMovieDetails(movieId);
        this.cast = await fetchMovieCast(movieId);
        this.reviews = await fetchMovieReviews(movieId);
        this.similarMovies = await fetchSimilarMoviesD(this.movie.genres[0].id);
        this.isMovieInDatabase = await this.checkIfMovieInDatabase(movieId);
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async checkIfMovieExists(movieId) {
      try {
        const token = localStorage.getItem('token'); // Récupérez le token du stockage local

        const response = await fetch(`http://localhost:3000/api/userMovies/${movieId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
            },
        });

        if (response.ok) {
            this.isMovieInDatabase = true; // Le film existe pour cet utilisateur
        } else {
            this.isMovieInDatabase = false; // Le film n'existe pas pour cet utilisateur
        }
      } catch (error) {
        console.error(error);
      }
    },

    async addMovieToDatabase(movieId) {
      try {
        const movieDetails = await fetchMovieDetails(movieId);
        
        const token = localStorage.getItem('token'); // Récupérez le token du stockage local

        const response = await fetch('http://localhost:3000/api/movies/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
            },
            body: JSON.stringify({
                title: movieDetails.title,
                overview: movieDetails.overview,
                voteAverage: movieDetails.vote_average,
                tmdbId: movieDetails.id, // Assurez-vous d'inclure l'ID du film de TMDB
                genreIds: movieDetails.genres.map(genre => genre.id), // Inclure les IDs de genres
                genres: movieDetails.genres.map(genre => genre.name), // Inclure les noms des genres

            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add movie to database');
        }

        const addedMovie = await response.json();
        console.log('Movie added:', addedMovie);
        this.isMovieInDatabase = true;

      } catch (error) {
        console.error(error);
      }
    },

    async removeMovieFromDatabase(movieId) {
      try {
        const token = localStorage.getItem('token'); // Récupérez le token du stockage local

        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
          },
        });

        if (!response.ok) {
          throw new Error('Failed to remove movie from database');
        }

        console.log('Movie removed');
        this.isMovieInDatabase = false; // Mettre à jour l'état du bouton
      } catch (error) {
        console.error(error);
      }
    },
    getPosterUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : '../assets/default-poster.png';
    },
    getProfileUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : '../assets/default-profile.png';
    },
  },
  mounted() {
    this.loadMovieDetails();
  },
};
</script>

<style scoped>
.movie-details-container {
  position: relative;
  color: white;
}

.background-image {
  width: 100%;
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.background-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%);
}

.movie-details-content {
  padding: 20px;
}

.movie-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.movie-rating {
  margin-bottom: 10px;
}

.movie-overview {
  margin-bottom: 20px;
}

.movie-cast {
  margin-bottom: 20px;
}

.cast-list {
  display: flex;
  flex-wrap: wrap;
}

.cast-item {
  margin-right: 20px;
  text-align: center;
}

.cast-item img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-reviews,
.similar-movies {
  margin-bottom: 20px;
}

.similar-movies ul {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
}

.similar-movies li {
  margin-right: 10px;
  margin-bottom: 10px;
}

.similar-movies img {
  width: 100px;
  height: 150px;
  border-radius: 5px;
  object-fit: cover;
}

.similar-movies p {
  text-align: center;
  margin-top: 5px;
}
</style>