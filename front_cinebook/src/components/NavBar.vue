<template>
    <nav class="navbar">
      <ul>
        <li><router-link to="/">Accueil</router-link></li>
        <li><router-link to="/friends">Amis</router-link></li>
        <li><router-link to="/notifications">Notifications</router-link></li>
        <li><router-link to="/profile">Mon Profil</router-link></li>
        <li @click="logout">Déconnexion</li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        // Logique de déconnexion
        localStorage.removeItem('token');
        this.$router.push('/login'); // Rediriger vers la page de connexion
      },
    },
  };
  </script>
  
  <style scoped>
  .navbar {
    background-color: #333;
    color: white;
    padding: 1rem;
  }
  
  .navbar ul {
    list-style-type: none;
    padding: 0;
  }
  
  .navbar li {
    display: inline;
    margin-right: 20px;
  }
  
  .navbar a {
    color: white;
    text-decoration: none;
  }
  
  .navbar a:hover {
    text-decoration: underline;
  }
  </style>
  