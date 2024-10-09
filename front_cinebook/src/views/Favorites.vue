<template>
    <div>
      <h2>Mes Favoris</h2>
      <div v-if="favorites.length === 0">Aucun film favori enregistré.</div>
      <div v-for="favorite in favorites" :key="favorite.id">
        <h3>{{ favorite.movie.title }}</h3>
        <button @click="removeFromFavorites(favorite.id)">Retirer des favoris</button>
      </div>
    </div>
  </template>
  
  <script>
  import { fetchFavorites, removeFavorite } from '@/services/tmdbService';
  
  export default {
    data() {
      return {
        favorites: [],
      };
    },
    methods: {
      async loadFavorites() {
        try {
          this.favorites = await fetchFavorites();
        } catch (error) {
          console.error(error);
        }
      },
      async removeFromFavorites(id) {
        try {
          await removeFavorite(id);
          this.loadFavorites(); // Recharge la liste des favoris
        } catch (error) {
          console.error(error);
        }
      },
    },
    mounted() {
      this.loadFavorites();
    },
  };
  </script>
  