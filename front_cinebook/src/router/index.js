import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import MovieDetails from '../views/MovieDetails.vue';
import { isTokenExpired } from '../utils/auth';
import { logout } from '../utils/auth'; // Assurez-vous que le chemin est correct


const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/movie/:id', name: 'MovieDetails', component: MovieDetails },
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