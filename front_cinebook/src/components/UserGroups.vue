<template>
  <div>
    <h2>Mes Groupes</h2>
    <ul v-if="groups.length">
      <li v-for="group in groups" :key="group.id">
        <router-link :to="{ name: 'GroupDetails', params: { id: group.id } }">{{ group.name }}</router-link>
      </li>
    </ul>
    <p v-else>Vous n'êtes membre d'aucun groupe.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      groups: [],
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
  },
};
</script>

<style scoped>
/* Style pour la liste des groupes */
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