<template>
  <div class="groups-container">
    <div class="header">
      <h2>Mes Groupes</h2>
      <router-link to="/all-groups" class="view-all-link">Voir tous mes groupes</router-link>
    </div>
    <div v-if="groups.length">
      <carousel 
        :items-to-show="computedItemsToShow" 
        :breakpoints="responsiveBreakpoints" 
        :navigation-enabled="true"
      >
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
            <div
              class="group-card"
              :style="{
                backgroundImage: group.coverPhoto ? `url(${getCoverPhotoUrl(group.coverPhoto)})` : 'none'
              }"
            >
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
  computed: {
    computedItemsToShow() {
      const maxItemsToShow = 6;
      return this.groups ? Math.min(this.groups.length, maxItemsToShow) : 1;
    },
    responsiveBreakpoints() {
      // Calcul des breakpoints en fonction du nombre de groupes disponibles
      return {
        1200: { itemsToShow: this.computedItemsToShow },
        1024: { itemsToShow: Math.min(this.groups.length, 3) },
        768: { itemsToShow: Math.min(this.groups.length, 2) },
        576: { itemsToShow: Math.min(this.groups.length, 2) },
        0: { itemsToShow: Math.min(this.groups.length, 1) },
      };
    },
    wrapAround() {
      // Désactiver le wrap-around s'il y a moins d'éléments que le nombre à afficher
      return this.groups.length > this.computedItemsToShow;
    },
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
    handleResize() {
      this.$forceUpdate(); // Force la mise à jour du composant pour recalculer les propriétés calculées
    },
  },
  mounted() {
    this.fetchGroups(); // Appeler fetchGroups lorsque le composant est monté
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.groups-container {
  margin-top: 200px;
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

.carousel__slide {
  margin-right: 15px;
}

.view-all-link {
  color: #007bff;
  text-decoration: none;
  font-size: 16px;
}

.view-all-link:hover {
  text-decoration: underline;
}

.group-card,
.special-card {
  width: 200px;
  background-size: cover;
  background-position: center;
  height: 300px;
  background-color: #2a619b;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box; /* Important pour aligner les tailles */
  overflow: hidden; /* Empêche tout débordement de contenu */
}

.special-card {
  background-image: url('http://localhost:3000/images/group_illu.jpg'); /* Exemple */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: none; /* Si les bordures créent une différence visuelle */
  padding: 0;
  box-shadow: none;
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

.group-name {
  font-size: 18px;
  color: white;
  text-align: center;
  margin-top: auto;
  padding: 5px;
  border-radius: 5px;
  bottom: 0; /* Ajouté pour positionner le texte en bas */
  width: 100%; /* Ajouté pour s'assurer que le texte prend toute la largeur */
}

/* Media query pour les écrans en dessous de 576 pixels */
@media (max-width: 576px) {
  .groups-container {
    overflow: hidden; /* Supprime le débordement */
  }
  .group-card {
    margin-right: 0; /* Supprime le margin-right pour les petits écrans */
  }
  .carousel__prev, .carousel__next {
    display: block; /* Assurez-vous que les flèches de navigation sont affichées */
  }
}
</style>