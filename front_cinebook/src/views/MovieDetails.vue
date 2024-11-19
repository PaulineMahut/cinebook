<template>
  <div class="movie-details-container" v-if="movie">
    <div class="background-image" :style="{ backgroundImage: `url(${getBackdropUrl(backdropPath)})` }"></div>
    <div class="movie-details-content">
      <div class="title-and-button">
        <h1>{{ movie.title }}</h1>
        <button v-if="!isLoading" @click="toggleMovieInDatabase" class="icon-toggle-database">
  <i :class="heartIconClass"></i>
</button>

      </div>
      <div class="movie-info">
        <span class="movie-runtime">{{ movie.runtime }} min</span>
        <div class="movie-genres">
          <span v-for="(genre, index) in movie.genres" :key="genre.id">
            {{ genre.name }}<span v-if="index < movie.genres.length - 1">, </span>
          </span>
        </div>
        <span class="movie-release-date">{{ movie.release_date.split('-')[0] }}</span>
      </div>
      <div class="movie-rating">
        <p><i class="fa-solid fa-star"></i> {{ movie.vote_average }}</p>
      </div>
      <div class="movie-overview">
        <p>{{ movie.overview }}</p>
      </div>
      <div class="movie-cast">
        <h2>Acteurs</h2>
        <div class="cast-list">
          <div v-for="actor in mainCast" :key="actor.id" class="cast-item">
            <img :src="getProfileUrl(actor.profile_path)" alt="Actor photo" />
            <p>{{ actor.name }}<br><small>as {{ actor.character }}</small></p>
          </div>
        </div>
      </div>
      <div class="user-reviews">
        <div class="user-reviews-add">
          <h2>Avis des utilisateurs</h2>
          <button @click="showCommentModal = true"><i class="fa-solid fa-plus"></i> Ajouter un commentaire</button>
        </div>
        <carousel :items-to-show="4">
          <slide v-for="comment in comments" :key="comment.id">
            <div class="comment-block">
              <div class="comment-header">
                <img :src="comment.user?.profilePicture ? getProfilePicUrl(comment.user.profilePicture) : '../assets/user_defaut.png'" alt="User photo" class="profile-picture" />
                <div class="comment-author">
                  <p><strong>{{ comment.user?.pseudo }}</strong></p>
                  <div class="comment-rating">
                    <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= comment.rating }">★</span>
                  </div>
                </div>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
              <p class="comment-date"><small>{{ new Date(comment.createdAt).toLocaleDateString() }}</small></p>
            </div>
          </slide>
        </carousel>
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
    </div>

    <!-- Modal pour ajouter un commentaire -->
    <div v-if="showCommentModal" class="modal-overlay" @click.self="showCommentModal = false">
      <div class="modal-content">
        <h2>Ajouter un commentaire</h2>
        <form @submit.prevent="addComment">
          <textarea v-model="newComment.content" placeholder="Add a comment"></textarea>
          <div class="rating-input">
            <span v-for="star in 5" :key="star" class="star" @click="newComment.rating = star" :class="{ filled: star <= newComment.rating }">★</span>
          </div>
          <button type="submit">Submit</button>
          <button type="button" @click="showCommentModal = false">Cancel</button>
        </form>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { fetchMovieDetails, fetchSimilarMoviesD, fetchMovieCast, fetchMovieImages } from '@/services/tmdbService';
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel'; // Importer le carrousel et les slides
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  components: {
    Pagination,
    Carousel,
    Slide,
    Navigation
  },
  data() {
    return {
      movie: null,
      isMovieInDatabase: null,
      cast: [],
      comments: [],
      newComment: {
        content: '',
        rating: null,
      },
      similarMovies: [],
      errorMessage: '',
      isMovieInDatabase: false,
      showCommentModal: false,
      backdropPath: '',
      isLoading: true,
    };
  },
  computed: {
    mainCast() {
      return this.cast.slice(0, 7);
    },
    limitedSimilarMovies() {
      return this.similarMovies.slice(0, 3);
    },
    heartIconClass() {
      return this.isMovieInDatabase ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    },
  },
  methods: {
    async loadMovieDetails() {
  try {
    const movieId = this.$route.params.id;
    this.movie = await fetchMovieDetails(movieId);
    this.cast = await fetchMovieCast(movieId);
    this.comments = await this.fetchComments(movieId);
    this.similarMovies = await fetchSimilarMoviesD(this.movie.genres[0].id);
    
    // Récupérer les images du film
    const backdrops = await fetchMovieImages(movieId);
    if (backdrops.length > 0) {
      this.backdropPath = backdrops[0].file_path;
    }
    
    // Vérifiez si le film est déjà dans la base de données
    await this.checkIfMovieExists(movieId);
  } catch (error) {
    this.errorMessage = error.message;
  }
},
    async fetchComments(movieId) {
      const response = await fetch(`http://localhost:3000/api/movies/${movieId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    async addComment() {
      const movieId = this.$route.params.id;
      const token = localStorage.getItem('token'); // Récupérez le token du stockage local

      const response = await fetch(`http://localhost:3000/api/movies/${movieId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ajoutez le token à l'en-tête
        },
        body: JSON.stringify(this.newComment),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      // Ajouter les informations de l'utilisateur au commentaire
      const user = this.$store.state.user;
      if (user) {
        comment.user = {
          pseudo: user.pseudo,
          profilePicture: user.profilePicture,
        };
      } else {
        comment.user = {
          pseudo: 'Unknown',
          profilePicture: '../assets/user_defaut.png',
        };
      }
      this.comments.push(comment);
      this.newComment.content = '';
      this.newComment.rating = null;
      this.showCommentModal = false;

      // Forcer la mise à jour de l'affichage des commentaires
      this.$forceUpdate();
    },
    async addMovieToDatabase(movieId) {
      try {
        const movieDetails = await fetchMovieDetails(movieId);
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:3000/api/movies/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: movieDetails.title,
            overview: movieDetails.overview,
            voteAverage: movieDetails.vote_average,
            tmdbId: movieDetails.id,
            genreIds: movieDetails.genres.map(genre => genre.id),
            genres: movieDetails.genres.map(genre => genre.name),
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'ajout du film à la base de données');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async removeMovieFromDatabase(movieId) {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du film de la base de données');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async toggleMovieInDatabase() {
      const toast = useToast();
      try {
        const movieId = this.movie.id;
        if (!this.isMovieInDatabase) {
          await this.addMovieToDatabase(movieId);
          this.isMovieInDatabase = true;
          toast.success('Le film a été ajouté aux favoris !');
        } else {
          await this.removeMovieFromDatabase(movieId);
          this.isMovieInDatabase = false;
          toast.success('Le film a été retiré des favoris !');
        }
        // Recharger la page après un court délai pour permettre à la notification de s'afficher
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Délai de 1,5 seconde
      } catch (error) {
        console.error('Erreur lors du toggle:', error);
        toast.error('Une erreur est survenue. Veuillez réessayer.');
      }
    },



    async checkIfMovieExists(movieId) {
  this.isLoading = true; // Commence le chargement
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isMovieInDatabase = false;
      this.isLoading = false;
      return;
    }

    const response = await fetch(`http://localhost:3000/api/userMovies/${movieId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    this.isMovieInDatabase = response.status === 200;
  } catch (error) {
    console.error('Erreur lors de la vérification du film:', error);
    this.isMovieInDatabase = false;
  } finally {
    this.isLoading = false; // Fin du chargement
  }
},


    getBackdropUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w1280${path}` : '../assets/user_defaut.png';
    },
    getProfileUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : '../assets/user_defaut.png';
    },
    getProfilePicUrl(path) {
      return `http://localhost:3000${path}`;
    },
    getPosterUrl(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : '../assets/default-poster.png';
    },
  },
  mounted() { this.loadMovieDetails();
  this.checkIfMovieExists(this.$route.params.id).then(() => {
    this.$forceUpdate(); // Forcer la mise à jour après la vérification
  });
},
watch: {
  '$route.params.id': {
    handler(newId) {
      if (newId) {
        this.loadMovieDetails(); // Recharger les détails du film
        this.checkIfMovieExists(newId).then(() => {
          this.$forceUpdate(); // Forcer le rendu après vérification
        });
      }
    },
    immediate: true
  }
}



};
</script>

<style scoped>
.movie-details-container {
  position: relative;
  color: white;
  position: relative;
  align-items: center;    
  display: flex;
    flex-direction: column;
}

.background-image {
  width: 100%;
  height: 500px;
  background-size: cover;
  position: relative;
}

.background-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, #222831 100%);
}

.movie-details-content {
  padding: 20px;
  max-width: 1200px;
}

.title-and-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-and-button h1 {
  margin-bottom: 25px;
}
 
.movie-rating {
  margin-top: 30px;
}

.movie-rating i.fa-star {
  color: #ffd700 !important;
}

.movie-rating i {
  color: #FFEE00 !important;
}

.movie-overview {
  margin-bottom: 50px;
  margin-top: 50px;
}

.movie-cast, .movie-cast h2 {
  margin-bottom: 50px;
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

.user-reviews {
  margin-bottom: 20px;
}

.user-reviews form {
  margin-bottom: 20px;
}

.user-reviews textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.user-reviews input[type="number"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.user-reviews button {
  padding: 10px 20px;
  background-color: #00ADB5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 50px;
}

.user-reviews button:hover {
  background-color: #00ADB5;
}

.user-reviews ul {
  list-style: none;
  padding: 0;
}

.user-reviews li {
  margin-bottom: 20px;
}

.user-reviews .profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.comment-block {
  background-color: rgba(98, 104, 111, 0.3);
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  margin-left: 10px;
}

.comment-rating {
  display: flex;
}

.star {
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
}

.star.filled {
  color: #ffd700;
}

.comment-content {
  margin-bottom: 10px;
}

.comment-date {
  font-size: 12px;
  color: #ccc;
}

.similar-movies, .similar-movies h2 {
  margin-bottom: 50px;
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

.movie-info {
  display: flex;
  align-items: center;
  gap: 10px; /* Espacement entre les éléments principaux */
}

/* Appliquer le trait vertical seulement entre les éléments principaux */
.movie-info > span:not(:last-child),
.movie-info > .movie-genres:not(:last-child) {
  position: relative;
  padding-right: 10px;
  margin-right: 10px;
}

.movie-info > span:not(:last-child)::after,
.movie-info > .movie-genres:not(:last-child)::after {
  content: "|"; /* Le trait vertical */
  position: absolute;
  right: 0;
  color: rgba(255, 255, 255, 0.7); /* Couleur du trait vertical, légèrement transparent */
}

/* Style pour le conteneur des genres */
.movie-genres {
  display: inline;
}

.movie-rating i {
  color: #FFEE00;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #222831;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  margin-top: 0;
}

.modal-content form {
  display: flex;
  flex-direction: column;
}

.modal-content textarea,
.modal-content input[type="number"] {
  margin-bottom: 10px;
}

.modal-content button {
  margin-top: 10px;
}

.user-reviews-add {
  margin-bottom: 30px;
}

.icon-toggle-database {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.heart-icon {
  font-size: 1.5rem;
  color: #ff4444; /* Couleur de votre choix */
  transition: all 0.3s ease;
}

.fa-heart {
  /* Animation optionnelle pour le clic */
  &:active {
    transform: scale(0.9);
  }
}

</style>