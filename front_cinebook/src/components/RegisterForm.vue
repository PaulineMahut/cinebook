<template>
  <div class="container-page-register">
  <div class="title-log">
  <h1>Créer un compte</h1>
  <p>Vous avez déjà un compte ? <router-link to="/login">Se connecter</router-link> </p>
</div>
  <form @submit.prevent="register">
    <div class="form-inputs">
      <div class="form-input">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-input">
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <div class="form-input">
          <input type="checkbox" id="rgpd" v-model="rgpdAccepted" />
          <label for="rgpd">J'accepte les <a href="/rgpd">conditions générales</a></label>
        </div>
    </div>
    <button class="button-register" type="submit">Register</button>
    <div v-if="error">{{ error }}</div>
  </form>
</div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      rgpdAccepted: false,
      error: null,
      defaultProfilePicture: 'user_defaut.png'
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
            rgpdAccepted: this.rgpdAccepted,
            password: this.password,
            profilePicture: this.defaultProfilePicture,
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

.container-page-register {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
}

.title-log {
  margin-bottom: 30px;
}

.title-log h1 {
  margin-bottom: 20px;
}

.form-input input[type="checkbox"] {
  margin-right: 10px;
}

.form-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.form-input {
  flex: 1;
  min-width: 200px;
}

.form-input label {
  display: block;
  margin-bottom: 5px;
}

.form-input input {
  width: 100%;
  padding: 10px;
  border-radius: 7px;
  box-sizing: border-box;
  background-color: #303C4F; /* Utilisez rgba pour la transparence */
}

.button-register {
  background-color: #00ADB5;
  color: white;
  padding: 10px;
  border-radius: 7px;
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
  box-sizing: border-box;
}
</style>