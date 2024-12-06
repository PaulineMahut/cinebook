<template>
  <div>
    <TopNavbar v-if="isAuthenticated" />
  </div>

  <div :class="{'no-margin': $route.name === 'MovieDetails'}" id="appp">
    <router-view /> 
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Sidebar from './components/sidebar/Sidebar.vue';
import { sidebarWidth } from '@/components/sidebar/state';
import TopNavbar from './components/TopNavbar.vue';

export default {
  name: 'App',
  components: { Sidebar, TopNavbar },
  computed: {
    ...mapState({
      isAuthenticated: state => state.isAuthenticated,
      notificationMessage: state => state.notificationMessage,
    }),
    notificationClass() {
      return this.notificationMessage.includes('déconnecté') ? 'notification-error' : 'notification-success';
    },
  },
  methods: {
    ...mapActions(['clearNotificationMessage']),
    clearNotification() {
      this.clearNotificationMessage();
    },
  },
  setup() {
    return { sidebarWidth }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #4171a0;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.bloc-carrousel {
  margin-top: 50px;
  margin-bottom: 50px;
}

/* .carousel__slide {
  align-items: baseline !important;
} */

.notification-success {
  background-color: #d4edda; /* Vert clair pour les notifications de succès */
  color: #155724;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  position: relative;
}

.notification-error {
  background-color: #f8d7da; /* Rouge clair pour les notifications d'erreur */
  color: #721c24;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

#appp {
  margin: 0 5rem;
}

#appp.no-margin {
  margin: 0;
}

@media screen and (max-width: 768px) {
  #appp {
    margin: 0 2rem;
  }
  
  #appp.no-margin {
    margin: 0;
  }
}
</style>