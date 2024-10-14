<template>
    <div>
        <h1>Bienvenue sur le tableau de bord !</h1>
        <p>Inscrivez-vous ou connectez-vous pour commencer.</p>
    </div>
    <div v-if="genres.length > 0">
            <h2>Genres de films disponibles :</h2>
            <ul>
                <li v-for="genre in genres" :key="genre.id">{{ genre.name }}</li>
            </ul>
        </div>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    <FavoriteMovies />
    <MovieList />
    <LogoutBouton />
    <PopularMovies />
    <RandomGenreMovies />
    <SimilarGenreMovies />
</template>

<script>
import LogoutBouton from '@/components/LogoutBouton.vue';
import MovieList from '@/components/MovieList.vue';
import PopularMovies from '@/components/PopularMovies.vue';
import FavoriteMovies from '@/components/FavoriteMovies.vue'; // Import du composant
import { fetchMovieGenres } from '@/services/tmdbService'; // Importer votre fonction
import SimilarGenreMovies from '@/components/SimilarGenreMovies.vue'; // Import du nouveau composant
import RandomGenreMovies from '../components/RandomGenreMovies.vue';

export default {
    name: 'Dashboard',
    components: {
        LogoutBouton,
        MovieList,
        PopularMovies,
        FavoriteMovies,
        SimilarGenreMovies,
        RandomGenreMovies,
    },
    data() {
        return {
            errorMessage: '',
            genres: [],
        };
    },
    async created() {
        try {
            this.genres = await fetchMovieGenres(); // Récupérer les genres lors de la création du composant
        } catch (error) {
            this.errorMessage = error.message; // Gérer les erreurs
        }
    },
    
};
</script>

<style scoped>
/* Ajoute ici tes styles pour la page d'accueil */
</style>