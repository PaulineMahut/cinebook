<template>
  <div class="all-movie-lists-container">
    <h2>Toutes Mes Listes de Films</h2>
    <div v-if="movieLists.length" class="movie-lists-grid">
      <div v-for="list in movieLists" :key="list.id" class="movie-list-card">
        <router-link :to="{ name: 'MovieListDetails', params: { id: list.id } }">
          <img
            v-if="list.coverPhoto"
            :src="getCoverPhotoUrl(list.coverPhoto)"
            alt="Photo de couverture"
            class="cover-photo"
          />
          <h3 class="list-name">{{ list.name }}</h3>
        </router-link>
      </div>
    </div>
    <p v-else>Vous n'avez créé aucune liste de films.</p>
  </div>
</template>

<script>
export default {
  name: 'AllUserMovieLists',
  data() {
    return {
      movieLists: [],
    };
  },
  async mounted() {
    await this.fetchMovieLists();
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
        this.movieLists = listsData;
      } catch (error) {
        console.error('Erreur de récupération des listes de films:', error);
        alert(`Failed to fetch movie lists: ${error.message}`);
      }
    },
    getCoverPhotoUrl(path) {
      return `http://localhost:3000${path}`;
    },
  },
};
</script>

<style scoped>
.all-movie-lists-container {
  margin-top: 100px;
  margin-bottom: 50px;
  max-width: 100%;
}

.all-movie-lists-container h2 {
  margin-bottom: 100px;
}

.movie-lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.movie-list-card {
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