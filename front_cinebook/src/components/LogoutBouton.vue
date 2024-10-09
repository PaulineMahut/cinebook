<template>
    <button @click="logout">Logout</button>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push({ path: '/login' });
      },
    },
  };
  </script>