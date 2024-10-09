// src/store/index.js
import { createStore } from 'vuex';
import { isTokenExpired, logout } from '@/utils/auth'; // Importez la fonction de vérification de token

const store = createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
  },
  mutations: {
    setAuthentication(state, status) {
      state.isAuthenticated = status;
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
  },
});

export default store;
