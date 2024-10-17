<!-- src/App.vue -->

<template>
  <div id="app">
    <router-view /> <!-- C'est ici que les composants de route seront affichés -->
    <Navbar />

  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

import { mapActions } from 'vuex';

export default {
  name: 'App',
  components: {
    Navbar,
  },
};
</script>

<style>
/* Ajoute ici tes styles globaux pour l'application */
</style>
