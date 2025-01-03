<template>
  <div class="container-map">
    <button class="button-map" @click="recenterMap">Recentrer sur ma position</button>
    <div id="map" ref="mapElement" style="height: 500px;"></div>
    <div v-if="loading">Chargement des cinémas...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-color-markers';


export default {
  name: 'Localisation',
  setup() {
    const mapElement = ref(null);
    let map = null; 
    let userMarker = null; 
    const cinemas = ref([]); 
    const loading = ref(true); 
    const error = ref(''); 

    onMounted(() => {
      console.log('Composant monté, vérification de mapElement');
      console.log(mapElement.value); 

      // Vérifier que le conteneur de la carte est monté
      if (mapElement.value) {
        // Initialiser la carte
        map = L.map(mapElement.value).setView([48.871332, 2.335302], 13); // Paris par défaut

        // Ajouter la couche de tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        console.log('Carte initialisée');

        // Obtenir la position de l'utilisateur
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;

              console.log('Position de l\'utilisateur obtenue:', userLat, userLng);

              // Définir la vue de la carte sur la position de l'utilisateur
              map.setView([userLat, userLng], 13);

              // Ajouter un marqueur à la position de l'utilisateur
              userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
                .bindPopup('Vous êtes ici!')
                .openPopup();

              // Charger les cinémas à proximité
              loadCinemas(userLat, userLng);
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

  const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


  const loadCinemas = async (lat, lng) => {
  console.log('Chargement des cinémas à proximité de:', lat, lng);
  let allCinemas = [];
  let page = 1;
  const pageSize = 100; // Limite par page
  let totalCinemas = 0;

  try {
    // Faire des requêtes en boucle jusqu'à ce qu'il n'y ait plus de nouveaux cinémas
    while (true) {
      console.log(`Chargement de la page ${page}`);
      
      const response = await fetch(`https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/etablissements-cinematographiques/records?limit=${pageSize}&start=${
      (page - 1) * pageSize}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des cinémas');
      }

      const data = await response.json();
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const cinemasPage = data.results.map(cinema => ({
          id: cinema.ndeg_auto, 
          name: cinema.nom,
          adresse: cinema.adresse,
          latitude: parseFloat(cinema.latitude), 
          longitude: parseFloat(cinema.longitude),
        }));

        // Ajouter les cinémas de cette page à la liste générale
        allCinemas = [...allCinemas, ...cinemasPage];

        // Vérifier si on a atteint le nombre total de cinémas disponibles (si spécifié dans la réponse)
        totalCinemas = data.total_count || totalCinemas;
        
        if (allCinemas.length >= totalCinemas) {
          break; // Sortir de la boucle si on a récupéré tous les cinémas
        }

        page++; // Passer à la page suivante
      } else {
        break; // Sortir si aucun résultat dans cette page
      }
    }

    console.log(`Total de cinémas récupérés: ${allCinemas.length}`);

    // Calculer les distances des cinémas par rapport à la position de l'utilisateur
    const cinemasWithDistance = allCinemas
      .filter(cinema => !isNaN(cinema.latitude) && !isNaN(cinema.longitude)) // Filtrer les cinémas avec coordonnées valides
      .map(cinema => {
        const distance = calculateDistance(lat, lng, cinema.latitude, cinema.longitude);
        return { ...cinema, distance }; // Ajouter la distance calculée
      });

    // Trier les cinémas par distance croissante
    const sortedCinemas = cinemasWithDistance.sort((a, b) => a.distance - b.distance);

    // Limiter les résultats à 10 cinémas
    cinemas.value = sortedCinemas.slice(0, 10);

    console.log('Cinémas les plus proches:', cinemas.value);

    const cinemaIcon = L.divIcon({
  html: '<i class="fa-solid fa-film" style="color: white; font-size: 16px; background-color:#03081B; padding: 8px; border-radius:20px;"></i>',
  className: 'custom-cinema-icon', 
  iconSize: [24, 24], // Taille de l'icône
  iconAnchor: [12, 12], // Point d'ancrage de l'icône
  popupAnchor: [0, -12], // Position du popup par rapport à l'icône
});

// Afficher les cinémas sur la carte
cinemas.value.forEach(cinema => {
  const marker = L.marker([cinema.latitude, cinema.longitude], { icon: cinemaIcon }).addTo(map);
  marker.bindPopup(`<b>${cinema.name}</b><br>${cinema.adresse}<br>Distance: ${cinema.distance.toFixed(2)} km`);
});

  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
    console.log('Chargement terminé');
  }
};

// Fonction de calcul de distance (formule de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  return distance;
};


    const recenterMap = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          console.log('Recentrage sur la position de l\'utilisateur:', userLat, userLng);

          // Recentre la carte et le marqueur
          if (map) {
            map.setView([userLat, userLng], 13);
            if (userMarker) {
              userMarker.setLatLng([userLat, userLng]);
            }
          }
        });
      }
    };

    return {
      mapElement,
      recenterMap,
      loading,
      error,
    };
  },
};
</script>

<style scoped>
#error {
  color: red;
}
#map {
  height: 500px;
  width: 100%;
}

.container-map {
  text-align: center;
}

.button-map {
  margin: 20px auto; /* Centrer verticalement avec un espace */
  padding: 10px 20px;
  border: #5DF6FF 1px solid;
  border-radius: 20px;
  display: inline-block; /* Nécessaire pour bien fonctionner avec text-align */
  cursor: pointer;
}

.custom-cinema-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
