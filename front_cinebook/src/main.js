import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
import store from './store'; // Importez le store
import 'vue3-carousel/dist/carousel.css';
import Vue3Geolocation from 'vue3-geolocation';

const app = createApp(App);
app.use(router);
app.use(store); // Utilisez le store Vuex
app.use(Vue3Geolocation);

app.mount('#app');