<template>
    <div>
        <h1>Bienvenue sur le tableau de bord !</h1>
        <p>Inscrivez-vous ou connectez-vous pour commencer.</p>
    </div>
    <div v-if="errorMessage">{{ errorMessage }}</div>
    <FavoriteMovies />
    <MovieList />
    <LogoutBouton />
    <PopularMovies />
</template>

<script>
import LogoutBouton from '@/components/LogoutBouton.vue';
import MovieList from '@/components/MovieList.vue';
import PopularMovies from '@/components/PopularMovies.vue';
import FavoriteMovies from '@/components/FavoriteMovies.vue'; // Import du composant

export default {
    name: 'Dashboard',
    components: {
        LogoutBouton,
        MovieList,
        PopularMovies,
        FavoriteMovies,
    },
    data() {
        return {
            errorMessage: '',
        };
    },
    
};
</script>

<style scoped>
/* Ajoute ici tes styles pour la page d'accueil */
</style>