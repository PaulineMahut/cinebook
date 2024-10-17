<template>
    <div>
      <h1>Profil de l'utilisateur</h1>
      <p v-if="user.email">Email : {{ user.email }}</p>
      <p v-if="user.pseudo">Pseudo : {{ user.pseudo }}</p>
      <p v-else>Chargement des informations utilisateur...</p>
    </div>
    <div>
        <!-- <FavoriteMovies /> -->
    </div>
  </template>
  
  <script>
//   import FavoriteMovies from '@/components/FavoriteMovies.vue';
export default {
    // components: {
    //   FavoriteMovies,
    // },
    data() {
      return {
        user: {
          email: '',
          pseudo: '',
        },
      };
    },
    async mounted() {
      const userId = this.$route.params.id; // Récupère l'ID de l'utilisateur depuis l'URL
      console.log(`ID utilisateur récupéré : ${userId}`); // Log pour vérifier l'ID récupéré
      try {
        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        console.log('Statut de la réponse:', response.status); // Log le statut de la réponse
  
        if (response.ok) {
          const userData = await response.json();
          console.log('Données utilisateur récupérées:', userData); // Log les données de l'utilisateur
          this.user.email = userData.email;
          this.user.pseudo = userData.pseudo;
        } else {
          console.error('Erreur lors de la récupération des données utilisateur:', response.statusText);
        }
      } catch (error) {
        console.error('Erreur de récupération du profil utilisateur:', error);
      }
    },
  };
  </script>
  
  <style scoped>
  /* Ajoutez des styles si nécessaire */
  </style>
  