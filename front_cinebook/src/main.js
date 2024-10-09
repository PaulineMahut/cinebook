import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
import store from './store'; // Importez le store



const app = createApp(App);
app.use(router);
app.use(store); // Utilisez le store Vuex

app.mount('#app');