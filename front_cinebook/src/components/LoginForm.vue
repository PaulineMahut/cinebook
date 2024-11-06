<template>
   <div class="title-log">
  <h1>Connexion</h1>
  <p>Vous n'avez pas de compte ? <router-link to="/register">Inscrivez-vous!</router-link> </p>
</div>
  <form @submit.prevent="login">
    <div class="form-inputs">
      <div class="form-input">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-input">
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
    </div>
    <button class="button-login" type="submit">Login</button>
    <div v-if="error">{{ error }}</div>
  </form>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null,
    };
  },
  methods: {
    ...mapActions(['login']),
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
          this.error = data.error;
          return;
        }

        const data = await response.json();
        this.$store.dispatch('login', data.token); // Appeler l'action login avec le token
        this.$router.push('/Dashboard');
      } catch (err) {
        this.error = 'An error occurred during login.';
        console.error("Login error:", err);
      }
    },
  },
};
</script>

<style scoped>

.title-log {
  margin-bottom: 30px;
}

.title-log h1 {
  margin-bottom: 20px;
}
.form-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 10px;
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
  background-color: #303C4F;
}

.button-login {
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