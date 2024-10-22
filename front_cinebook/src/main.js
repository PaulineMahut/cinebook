import { createApp } from 'vue'
import './style.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import router from './router';
import store from './store'; // Importez le store
import 'vue3-carousel/dist/carousel.css';
import Vue3Geolocation from 'vue3-geolocation';
import '@fortawesome/fontawesome-free/js/all'

const app = createApp(App);
app.use(router);
app.use(store); // Utilisez le store Vuex
app.use(Vue3Geolocation);

app.mount('#app');