<script>
import SidebarLink from './SidebarLink.vue';
import { ref } from 'vue';
import { collapsed, sidebarWidth } from './state';
import { toggleSidebar } from './state';

export default {
  components: {
    SidebarLink, // Ajoutez SidebarLink ici
  },
  setup() {
    return { 
      collapsed, 
      toggleSidebar, 
      sidebarWidth 
    };
  }
}
</script>



<template>
  <div class="sidebar" :style="{ width: sidebarWidth }">
    <h1>
      <span v-if="collapsed">
        <div><img class="logo" src="@/assets/logo_traitsclair.png" alt=""></div>
        <div></div>
      </span>
      <span v-else><img class="logo" src="@/assets/logo_traitsclair.png" alt=""></span>
    </h1>

    <SidebarLink to="/" icon="fas fa-home">Home</SidebarLink>
    <SidebarLink to="/dashboard" icon="fas fa-columns">Dashboard</SidebarLink>
    <SidebarLink to="/recherche" icon="fas fa-chart-bar">Recherche</SidebarLink>
    <SidebarLink to="/profile" icon="fas fa-user">Profile</SidebarLink>
    <SidebarLink to="/map" icon="fas fa-image">Map</SidebarLink>
    <SidebarLink to="/notifications" icon="fas fa-bell">Notifications</SidebarLink>
    <SidebarLink to="/settings" icon="fas fa-gear">Paramètres</SidebarLink>

    <span
      class="collapse-icon"
      :class="{ 'rotate-180': collapsed }"
      @click="toggleSidebar"
    >
      <i class="fas fa-angle-double-left" />
    </span>
  </div>
</template>

<style>
:root {
  --sidebar-bg-color: #03081B;
  --sidebar-item-hover: #62686F;
  --sidebar-item-active: #62686F;
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);

  float: left;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 0.5em;

  transition: 0.3s ease;

  display: flex;
  flex-direction: column;
}

.sidebar h1 {
  height: 2.5em;
}

.collapse-icon {
  position: absolute;
  bottom: 0;
  padding: 0.75em;

  color: rgba(255, 255, 255, 0.7);

  transition: 0.2s linear;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}

.logo {
  width: 50%;
  border-radius: 50%;
  margin-right: 10px;
}
</style>