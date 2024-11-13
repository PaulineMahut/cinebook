<template>
  <div class="groups-container">
    <h2>Mes Groupes</h2>
    <div v-if="groups.length">
      <carousel :items-to-show="4" :navigation-enabled="true">
        <slide
          v-for="group in groups"
          :key="group.id"
          :class="{'special-card': group.isAddButton}"
        >
          <router-link
            v-if="group.isAddButton"
            to="/add-group"
          >
            <div class="group-card special-card">
              <button class="add-button">+</button>
            </div>
          </router-link>
          <router-link
            v-else
            :to="{ name: 'GroupDetails', params: { id: group.id } }"
          >
            <div class="group-card">
              <img v-if="group.coverPhoto" :src="getCoverPhotoUrl(group.coverPhoto)" alt="Photo de couverture" class="cover-photo" />
              <h3 class="group-name">{{ group.name }}</h3>
            </div>
          </router-link>
        </slide>
        <template #addons>
          <Navigation />
        </template>
      </carousel>
    </div>
    <p v-else>Vous n'avez rejoint aucun groupe.</p>
  </div>
</template>

<script>
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

export default {
  name: 'UserGroups',
  components: {
    Carousel,
    Slide,
    Navigation,
  },
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

        // Ajoute un faux groupe pour l'option d'ajout
        this.groups = [
          { id: 'add-new', name: 'Ajouter un groupe', isAddButton: true },
          ...groupsData,
        ];
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
.groups-container {
  margin: 20px;
  max-width: 100%;
}

/* .carousel__slide {
  margin-right: 15px;
} */

.group-card {
  width: 200px;
  height: 300px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}


.add-button {
  font-size: 48px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-photo {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
}

.group-name {
  font-size: 18px;
  color: #343a40;
  text-align: center;
  margin-top: auto;
}
</style>