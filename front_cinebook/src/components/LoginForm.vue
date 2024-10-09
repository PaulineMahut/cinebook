<template>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
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
        async login() {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
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
            this.error = data.error; // Gérer les erreurs
            return;
        }

        const data = await response.json();
        console.log("Login response:", data); // Log de la réponse
        localStorage.setItem('token', data.token); // Sauvegarder le token dans le stockage local
        alert('Login successful!');
        this.$router.push('/Dashboard'); // Rediriger vers la page d'accueil après connexion
    } catch (err) {
        this.error = 'An error occurred during login.'; // Gestion des erreurs
        console.error("Login error:", err); // Log d'erreur
    }
},

    },
};
</script>

<style scoped>
/* Ajoute ici tes styles */
</style>
