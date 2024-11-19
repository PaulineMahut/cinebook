<template>
  <div class="movie-lists-container">
    <h2>Mes Listes de Films</h2>
    <div v-if="movieLists.length">
      <carousel 
        :items-to-show="computedItemsToShow" 
        :breakpoints="responsiveBreakpoints" 
        :navigation-enabled="true"
      >
        <!-- Carte spéciale pour créer une nouvelle liste de films -->
        <slide
          v-for="list in movieLists"
          :key="list.id"
          :class="{'special-card': list.isAddButton}"
        >
          <router-link
            v-if="list.isAddButton"
            to="/add-list"
          >
            <div class="movie-list-card special-card">
              <button class="add-button">+</button>
            </div>
          </router-link>
          <router-link
            v-else
            :to="{ name: 'MovieListDetails', params: { id: list.id } }"
          >
            <div class="movie-list-card">
              <img
                v-if="list.coverPhoto"
                :src="getCoverPhotoUrl(list.coverPhoto)"
                alt="Photo de couverture"
                class="cover-photo"
              />
              <h3 class="list-name">{{ list.name }}</h3>
            </div>
          </router-link>
        </slide>
        <template #addons>
          <Navigation />
        </template>
      </carousel>
    </div>
    <p v-else>Vous n'avez créé aucune liste de films.</p>
  </div>
</template>


<script>
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

export default {
  name: 'UserMovieLists',
  components: {
    Carousel,
    Slide,
    Navigation,
  },
  data() {
    return {
      movieLists: [],
    };
  },
  async mounted() {
    await this.fetchMovieLists();
  },
  computed: {
    computedItemsToShow() {
      const maxItemsToShow = 6;
      return this.movieLists ? Math.min(this.movieLists.length, maxItemsToShow) : 1;
    },
    responsiveBreakpoints() {
      // Calcul des breakpoints en fonction du nombre de groupes disponibles
      return {
        1200: { itemsToShow: this.computedItemsToShow },
        1024: { itemsToShow: Math.min(this.movieLists.length, 3)},
        768: { itemsToShow: Math.min(this.movieLists.length, 2) },
        576: { itemsToShow: Math.min(this.movieLists.length, 2) },
        0: { itemsToShow: Math.min(this.movieLists.length, 1) },
      };
    },
    wrapAround() {
      // Désactiver le wrap-around s'il y a moins d'éléments que le nombre à afficher
      return this.groups.length > this.computedItemsToShow;
    },
  },
  methods: {
    async fetchMovieLists() {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:3000/api/movie-lists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur lors de la récupération des listes de films:', errorData);
          throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }

        const listsData = await response.json();

        // Ajoute une carte fictive pour l'option d'ajout
        this.movieLists = [
          { id: 'add-new', name: 'Ajouter une liste', isAddButton: true },
          ...listsData,
        ];
      } catch (error) {
        console.error('Erreur de récupération des listes de films:', error);
        alert(`Failed to fetch movie lists: ${error.message}`);
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
    this.fetchMovieLists(); // Appeler fetchGroups lorsque le composant est monté
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>


<style scoped>

.movie-lists-container {
  margin-top: 50px;
  margin-bottom: 50px;
  max-width: 100%;
}

.movie-lists-container h2 {
  margin-bottom: 50px;
} 

.movie-list-card {
  width: 200px;
  height: 300px;
  background-color: #343a40;
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

.list-name {
  font-size: 18px;
  color: white;
  text-align: center;
  margin-top: auto;
}
</style>
