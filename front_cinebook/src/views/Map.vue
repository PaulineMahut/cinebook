<template>
    <div class="container-map-page">
      <h1>Trouvez les cinémas près de chez vous</h1>
    </div>
      <LocalisationCinema />
  </template>
  
  <script>
import LocalisationCinema from '../components/LocalisationCinema.vue';
  
  export default {
    components: {
      LocalisationCinema,
    },
  };
  </script>
  
<style>

.container-map-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
}
</style>