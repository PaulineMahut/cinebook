<!-- src/App.vue -->

<template>
  <div id="app">
    <router-view /> <!-- C'est ici que les composants de route seront affichés -->
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'App',
};
</script>

<style>
/* Ajoute ici tes styles globaux pour l'application */
</style>
