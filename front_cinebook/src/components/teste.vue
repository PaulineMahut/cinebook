<template>
    <div>
      <h1>Localisation de ma Position</h1>
      <div id="map" ref="mapElement" style="height: 500px;"></div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  
  export default {
    name: 'Localisation',
    setup() {
      const mapElement = ref(null);
  
      onMounted(() => {
        // Vérifier que le conteneur de la carte est monté
        if (mapElement.value) {
          // Initialiser la carte
          const map = L.map(mapElement.value).setView([48.871332, 2.335302], 13); // Paris par défaut
  
          // Ajouter la couche de tuiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
  
          // Obtenir la position de l'utilisateur
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
  
                // Définir la vue de la carte sur la position de l'utilisateur
                map.setView([userLat, userLng], 13);
  
                // Ajouter un marqueur à la position de l'utilisateur
                L.marker([userLat, userLng]).addTo(map)
                  .bindPopup('Vous êtes ici!')
                  .openPopup();
              },
              () => {
                alert('Erreur lors de la localisation de votre position.');
              }
            );
          } else {
            alert('La géolocalisation n\'est pas supportée par ce navigateur.');
          }
        } else {
          console.error('Le conteneur de la carte n\'a pas été trouvé.');
        }
      });
  
      return {
        mapElement,
      };
    },
  };
  </script>
  
  <style scoped>
  #map {
    height: 500px;
    width: 100%;
  }
  </style>
  