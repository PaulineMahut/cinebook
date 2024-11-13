// src/store/index.js
import { createStore } from 'vuex';
import { isTokenExpired, logout } from '@/utils/auth';

const store = createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    userProfile: null,
    notificationMessage: '',
    friendCount: 0,
    movieListCount: 0,
    groupCount: 0,
  },
  mutations: {
    setAuthentication(state, status) {
      state.isAuthenticated = status;
    },
    setUserProfile(state, profile) {
      state.userProfile = profile;
    },
    setNotificationMessage(state, message) {
      state.notificationMessage = message;
    },
    setFriendCount(state, count) {
      state.friendCount = count;
    },
    setMovieListCount(state, count) {
      state.movieListCount = count;
    },
    setGroupCount(state, count) {
      state.groupCount = count;
    },
  },
  actions: {
    checkAuthentication({ commit }) {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        logout();
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
            commit('setUserProfile', userData);
            commit('setFriendCount', userData.friendCount);
            commit('setMovieListCount', userData.movieListCount);
            commit('setGroupCount', userData.groupCount);
          } else {
            console.error('Erreur lors de la récupération du profil utilisateur');
          }
        } catch (error) {
          console.error('Erreur lors de la requête API :', error);
        }
      }
    },
    async updateUserProfile({ commit }, formData) {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to update user profile');
        }

        const updatedProfile = await response.json();
        commit('setUserProfile', updatedProfile);
        commit('setNotificationMessage', 'Profil mis à jour avec succès');
      } catch (error) {
        console.error('Error updating user profile:', error);
        commit('setNotificationMessage', 'Erreur lors de la mise à jour du profil');
      }
    },
    login({ commit }, token) {
      localStorage.setItem('token', token);
      commit('setAuthentication', true);
      commit('setNotificationMessage', '');
      commit('setNotificationMessage', 'Vous êtes connecté');
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      commit('setAuthentication', false);
      commit('setNotificationMessage', 'Vous vous êtes déconnecté');
    },
    clearNotificationMessage({ commit }) {
      commit('setNotificationMessage', '');
    },
  },
});

export default store;