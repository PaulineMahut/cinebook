<template>
    <div>
        <h2>Liste des Films Favoris</h2>
        <div v-if="movies.length" class="movies-grid">
            <div v-for="movie in movies" :key="movie.tmdbId" class="movie-item">
                <router-link :to="{ name: 'MovieDetails', params: { id: movie.tmdbId } }">
                    <img v-if="movie.poster_path" :src="getPosterUrl(movie.poster_path)" alt="Movie Poster" />
                    <h3>{{ movie.title }}</h3>
                    <p>{{ movie.release_date }}</p>
                </router-link>
            </div>
        </div>
        <div v-else>
            <p>Aucun film favori trouvé.</p>
        </div>
    </div>
</template>

<script>
import { fetchMovieDetails } from '@/services/tmdbService';

export default {
    name: 'FavoriteMovies',
    data() {
        return {
            movies: [] // Initialiser un tableau vide pour stocker les films
        };
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
    }
};
</script>

<style>
.movies-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px; /* Espacement entre les films */
}

.movie-item {
    width: 200px; /* Largeur fixe pour chaque film */
    text-align: center; /* Centrer le texte */
}

.movie-item img {
    width: 100%; /* Remplir la largeur du conteneur */
    height: auto; /* Maintenir le ratio d'aspect */
}
</style>
