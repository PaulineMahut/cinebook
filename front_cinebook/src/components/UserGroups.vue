<template>
    <div>
      <h2>Mes Groupes</h2>
      <ul v-if="groups.length">
        <li v-for="group in groups" :key="group.id">
          <a href="#" @click.prevent="selectGroup(group)">{{ group.name }}</a>
        </li>
      </ul>
      <p v-else>Vous n'êtes membre d'aucun groupe.</p>
  
      <div v-if="selectedGroup">
        <h3>Membres du groupe {{ selectedGroup.name }}</h3>
        <ul>
          <li v-for="member in selectedGroup.members" :key="member.user.id">
            {{ member.user.pseudo }} ({{ member.user.email }})
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        groups: [],
        selectedGroup: null,
      };
    },
    async mounted() {
      await this.loadGroups();
    },
    methods: {
      async loadGroups() {
        try {
          const response = await fetch('http://localhost:3000/api/user/groups', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            this.groups = await response.json();
          } else {
            console.error('Erreur lors de la récupération des groupes');
          }
        } catch (error) {
          console.error('Erreur de récupération des groupes:', error);
        }
      },
      selectGroup(group) {
        this.selectedGroup = group;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style pour la liste des groupes et des membres */
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    margin: 5px 0;
  }
  
  a {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
  }
  </style>