<template>
    <div class="all-groups-container">
      <div class="header">
        <h2>Tous Mes Groupes</h2>
      </div>
      <div v-if="groups.length" class="groups-grid">
        <div v-for="group in groups" :key="group.id" class="group-card">
          <router-link :to="{ name: 'GroupDetails', params: { id: group.id } }">
            <div
              :style="{
                backgroundImage: group.coverPhoto ? `url(${getCoverPhotoUrl(group.coverPhoto)})` : 'none'
              }"
              class="group-cover"
            ></div>
            <h3 class="group-name">{{ group.name }}</h3>
          </router-link>
        </div>
      </div>
      <p v-else>Vous n'avez rejoint aucun groupe.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AllUserGroups',
    data() {
      return {
        groups: [],
      };
    },
    async mounted() {
      await this.fetchGroups();
    },
    methods: {
      async fetchGroups() {
        const token = localStorage.getItem('token');
  
        try {
          const response = await fetch('http://localhost:3000/api/user/groups', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur lors de la récupération des groupes:', errorData);
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
          }
  
          const groupsData = await response.json();
          this.groups = groupsData;
        } catch (error) {
          console.error('Erreur de récupération de la liste des groupes:', error);
          alert(`Failed to fetch groups: ${error.message}`);
        }
      },
      getCoverPhotoUrl(path) {
        return `http://localhost:3000${path}`;
      },
    },
  };
  </script>
  
  <style scoped>
  .all-groups-container {
    margin-top: 50px;
    margin-bottom: 50px;
    max-width: 100%;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 50px;
  }
  
  .header h2 {
    margin: 0;
  }
  
  .view-all-link {
    color: #007bff;
    text-decoration: none;
    font-size: 16px;
  }
  
  .view-all-link:hover {
    text-decoration: underline;
  }
  
  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .group-card {
    background-color: #343a40;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .group-cover {
    width: 100%;
    height: 150px;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  
  .group-name {
    font-size: 18px;
    color: white;
    text-align: center;
    margin-top: auto;
  }
  </style>