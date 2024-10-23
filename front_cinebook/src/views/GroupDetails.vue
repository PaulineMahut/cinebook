<template>
    <div>
      <h2>Détails du Groupe</h2>
      <div v-if="group">
        <h3>{{ group.name }}</h3>
        <p>{{ group.description }}</p>
        <h4>Membres</h4>
        <ul>
          <li v-for="member in group.members" :key="member.user.id">
            {{ member.user.pseudo }} ({{ member.user.email }})
          </li>
        </ul>
      </div>
      <p v-else>Chargement des détails du groupe...</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['id'],
    data() {
      return {
        group: null,
      };
    },
    async mounted() {
      await this.loadGroupDetails();
    },
    methods: {
      async loadGroupDetails() {
        try {
          const response = await fetch(`http://localhost:3000/api/groups/${this.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            this.group = await response.json();
          } else {
            console.error('Erreur lors de la récupération des détails du groupe');
          }
        } catch (error) {
          console.error('Erreur de récupération des détails du groupe:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style pour la page de détails du groupe */
  </style>