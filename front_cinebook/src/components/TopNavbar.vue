<template>
  <nav class="top-navbar">
    <div class="left-section">
      <div class="logo">
        <img src="../assets/logo_traitsclair.png" alt="Logo" />
      </div>
      <!-- Menu hamburger pour les petits écrans -->
      <div class="menu-toggle" @click="toggleMobileMenu">
        <i class="fa-solid fa-bars"></i>
      </div>
      <!-- Liens de navigation -->
      <div class="nav-links" :class="{ open: mobileMenuOpen }">
        <RouterLink to="/" icon="fas fa-home">Home</RouterLink>
        <RouterLink to="/dashboard" icon="fas fa-columns">Dashboard</RouterLink>
        <RouterLink to="/map" icon="fas fa-image">Map</RouterLink>
      </div>
    </div>
    <div class="right-section">
      <RouterLink to="/recherche" class="icon-navbar"><i class="fa-solid fa-magnifying-glass"></i></RouterLink>
      <RouterLink to="/notifications" class="icon-navbar"><i class="fa-solid fa-bell"></i></RouterLink>
      <div class="profile-container" @click="toggleDropdown">
        <img :src="userProfilePicture" alt="Photo de profil" class="profile-picture" />
        <div v-if="dropdownOpen" class="dropdown-menu">
          <RouterLink to="/profile">Profile</RouterLink>
          <RouterLink to="/settings">Paramètres</RouterLink>
          <LogoutBouton />
        </div>
      </div>
    </div>
  </nav>
</template>

  
  <script>
  import { RouterLink } from 'vue-router';
  import LogoutBouton from './LogoutBouton.vue';
  
  export default {
    name: 'TopNavbar',
    components: {
      RouterLink,
      LogoutBouton,
    },
    data() {
      return {
        userProfilePicture: '../assets/default-profile.png', // Remplacez par le chemin de l'image par défaut
        dropdownOpen: false,
        mobileMenuOpen: false,
      };
    },
    async mounted() {
      await this.fetchUserProfile();
    },
    methods: {
      async fetchUserProfile() {
        try {
          const response = await fetch('http://localhost:3000/api/user/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            const userProfile = await response.json();
            if (userProfile && userProfile.profilePicture) {
              this.userProfilePicture = `http://localhost:3000${userProfile.profilePicture}`;
            }
          } else {
            console.error('Erreur lors de la récupération du profil utilisateur');
          }
        } catch (error) {
          console.error('Erreur de récupération du profil utilisateur:', error);
        }
      },
      toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  },
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  },
    },
  };
  </script>
  
  <style scoped>
  .top-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #343a40;
    padding: 10px 20px;
    color: white;
  }
  
  .left-section {
    display: flex;
    align-items: center;
  }
  
  .logo img {
    height: 40px;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  
  .nav-links a {
    color: white;
    text-decoration: none;
    margin-left: 20px;
    display: flex;
    align-items: center;
  }
  
  .nav-links a:hover {
    color: #5df6ff !important;
  }
  
  .nav-links i {
    margin-right: 5px;
  }
  
  .right-section {
    display: flex;
    align-items: center;
    gap: 30px; /* Ajouter un espacement entre les éléments */
  }
  
  .icon-navbar {
    font-size: 20px; /* Augmenter la taille des icônes */
    color: white;
  }

  .icon-navbar:hover {
    color: #5df6ff;
  }
  
  .profile-container {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .profile-picture {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 60px;
    right: 0;
    background-color: white;
    color: black;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }
  
  .dropdown-menu a {
    color: black;
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 5px;
  }
  
  .dropdown-menu a:hover {
    background-color: #f0f0f0;
  }

  .menu-toggle {
  display: none;
  cursor: pointer;
  font-size: 24px;
  color: white;
}

/* Afficher le menu burger uniquement sur tablette */
@media (min-width: 768px) and (max-width: 400px) {
  .menu-toggle {
    display: block; /* Afficher le menu burger */
  }
  
  .nav-links {
    display: none; /* Cacher les liens de navigation */
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    background-color: #343a40;
    width: 100%;
    padding: 10px 0;
  }

  .nav-links.open {
    display: flex; /* Afficher les liens si le menu est ouvert */
  }

  .nav-links a {
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    text-align: center;
  }
}

  @media (max-width: 768px) {
  .logo {
    display: none;
  }
  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    background-color: #343a40;
    width: 100%;
    padding: 10px 0;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    text-align: center;
  }

  .menu-toggle {
    display: block;
  }

  .right-section {
    display: flex;
    gap: 15px;
  }

  .profile-container {
    display: flex;
    align-items: center;
  }

  .dropdown-menu {
    position: fixed;
    top: 60px;
    right: 10px;
    width: 200px;
  }

  .icon-navbar {
    font-size: 18px;
  }

  .profile-picture {
    width: 40px;
    height: 40px;
  }
  }
  </style>