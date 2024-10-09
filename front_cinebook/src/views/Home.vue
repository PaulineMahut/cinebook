<!-- src/views/Home.vue -->

<template>
    <div>
      <h1>Bienvenue sur CineBook!</h1>
      <p>Inscrivez-vous ou connectez-vous pour commencer.</p>
      <router-link to="/register">S'inscrire</router-link>
      <router-link to="/login">Se connecter</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Home',
  };
  </script>
  
  <style scoped>
  /* Ajoute ici tes styles pour la page d'accueil */
  </style>
  