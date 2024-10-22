import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import MovieDetails from '../views/MovieDetails.vue';
import { isTokenExpired } from '../utils/auth';
import { logout } from '../utils/auth'; // Assurez-vous que le chemin est correct
import Map from '../views/Map.vue';
import Profile from '../views/Profile.vue';
import Recherche from '../views/Recherche.vue';
import UserProfile from '../components/UserProfile.vue';
import Friends from '../components/Friends.vue';
import Notification from '../views/Notifications.vue';
import GroupForm from '@/components/GroupForm.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/map', name: 'Map', component: Map },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/movie/:id', name: 'MovieDetails', component: MovieDetails },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/recherche', name: 'Recherche', component: Recherche },
    {
        path: '/user/:id',  // Route dynamique avec paramètre d'ID
        name: 'UserProfile',
        component: UserProfile,
    },
    { path: '/friends/:id', name: 'friends', component: Friends },
    { path: '/notification', name: 'Notification', component: Notification },
    {
        path: '/add-group',
        name: 'AddGroup',
        component: GroupForm,
      },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    console.log(`Navigating to: ${to.name}`); // Log de la route
    console.log(`Token: ${token}`); // Log du token

    if (isTokenExpired(token)) {
        console.log('Token expired, logging out...');
        logout(); // Déconnexion automatique

        // Vérifiez si la route est autorisée pour les non-authentifiés
        if (to.name === 'Login' || to.name === 'Home' || to.name === 'Register') {
            next(); // Permettre l'accès
        } else {
            next({ name: 'Login' }); // Redirige vers la page de connexion
        }
    } else {
        next(); // Passe à la route demandée
    }
});



export default router;