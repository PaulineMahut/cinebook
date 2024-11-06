<template>
  <button @click="handleLogout">Logout</button>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout();
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
/* Ajoute ici tes styles */
</style>