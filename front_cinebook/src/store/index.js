// src/store/index.js
import { createStore } from 'vuex';
import { isTokenExpired, logout } from '@/utils/auth'; // Importez la fonction de vérification de token

const store = createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    userProfile: null, // Ajout du profil utilisateur dans le state
  },
  mutations: {
    setAuthentication(state, status) {
      state.isAuthenticated = status;
    },
    setUserProfile(state, profile) {
      state.userProfile = profile; // Mutation pour mettre à jour le profil utilisateur
    },
  },
  actions: {
    checkAuthentication({ commit }) {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        logout(); // Déconnexion automatique
        commit('setAuthentication', false);
      } else {
        commit('setAuthentication', true);
      }
    },
    async fetchUserProfile({ commit }) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            commit('setUserProfile', userData); // Mettre à jour le store avec les données utilisateur
          } else {
            console.error('Erreur lors de la récupération du profil utilisateur');
          }
        } catch (error) {
          console.error('Erreur lors de la requête API :', error);
        }
      }
    },
  },
});

export default store;
