<template>
    <div>
        <h1>Bienvenue sur le tableau de bord !</h1>
        <p>Inscrivez-vous ou connectez-vous pour commencer.</p>
    </div>
    <div v-if="errorMessage">{{ errorMessage }}</div>
        <!-- <div v-else>{{ protectedData }}</div> -->
    <!-- <MovieList /> -->
    <LogoutBouton />
    <!-- <PopularMovies /> -->
</template>

<script>
// import { fetchProtectedResource } from '../utils/api';
import LogoutBouton from '@/components/LogoutBouton.vue';
// import MovieList from '@/components/MovieList.vue';
// import PopularMovies from '@/components/PopularMovies.vue';

export default {
    name: 'Dashboard',
    components: {
        LogoutBouton,
        // MovieList,
        // PopularMovies,
    },
    data() {
        return {
            // protectedData: null,
            // errorMessage: '',
        };
    },
    // async mounted() {
    //     try {
    //         const data = await fetchProtectedResource('protected-resource');
    //         this.protectedData = data;
    //     } catch (error) {
    //         this.errorMessage = error.message;
    //     }
    // },
};
</script>

<style scoped>
/* Ajoute ici tes styles pour la page d'accueil */
</style>