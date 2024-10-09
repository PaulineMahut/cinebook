<!-- src/components/RegisterForm.vue -->

<template>
    <form @submit.prevent="register">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Register</button>
      <div v-if="error">{{ error }}</div>
    </form>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: null,
      };
    },
    methods: {
      async register() {
        try {
          const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });
  
          if (!response.ok) {
            const data = await response.json();
            this.error = data.errors; // Gérer les erreurs
            return;
          }
  
          alert('Registration successful!');
          this.$router.push('/login'); // Rediriger vers la page de connexion après inscription
        } catch (err) {
          this.error = 'An error occurred during registration.'; // Gestion des erreurs
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Ajoute ici tes styles */
  </style>
  