<template>
  <div v-if="votingSession" class="vote-page-container">
    <div class="voting-session-header">
      <p v-if="votingSession.movieList.user">
        Un vote a été lancé par <span>{{ votingSession.movieList.user.pseudo }} !</span>
      </p>
      <p>{{ votingSession.description }}</p>
    </div>

    <div class="voting-center">

  

    <div class="voting-session-details">
      <div class="session-info">
        <div class="info-item">
          <i class="fa-solid fa-user-group"></i>
          <span>{{ totalVotes }} votes</span>
        </div>
        <div class="info-item right-align">
          <i class="fa-solid fa-clock"></i>
          <span>{{ formatTimeRemaining(timeRemaining) }}</span>
        </div>
      </div>
    </div>

    <div v-if="timeRemaining > 0" class="form-vote">
      <form @submit.prevent="voteForMovie">
        <div v-for="item in votingSession.movieList.items" :key="item.id" class="movie-radio-container" :class="{ selected: selectedMovieId === item.id }">
          <input type="radio" :id="item.id" :value="item.id" v-model="selectedMovieId" required />
          <label :for="item.id" class="movie-label">{{ item.title }}</label>
        </div>
        <button type="submit" class="btn-vote">Voter</button>
      </form>
    </div>

    <div v-if="!timeRemaining" class="result-vote">
      <h2>Le vote est terminé!</h2>
      <div v-if="winningMovie" class="winning-result">
        <span class="winning-movie-title">{{ winningMovie.title }}</span>
        <p class="vote-text">a remporté le vote !</p>
        <span class="winning-icon">🎉</span>
      </div>
      <p v-else>Aucun vote n'a été enregistré</p>
    </div>

    <div v-if="votingSession.votes && votingSession.votes.length" class="voting-results">
      <h2>Résultats des votes</h2>
      <ul>
        <li v-for="vote in votingSession.votes" :key="vote.id" class="vote-item">
          <img :src="getProfilePictureUrl(vote.user.profilePicture)" alt="Photo de profil" class="profile-picture" />
          <span>{{ vote.user.pseudo }} a voté pour {{ vote.movieListItem.title }} !</span>
        </li>
      </ul>
    </div>
  </div>
  </div>
  <p v-else>Chargement des détails de la session de vote...</p>
</template>

<script>
export default {
  data() {
    return {
      votingSession: null,
      selectedMovieId: null,
      timeRemaining: '',
      totalVotes: 0,
      winningMovie: null,
    };
  },
  async mounted() {
    await this.loadVotingSession();
    this.startCountdown();
  },
  methods: {
    async loadVotingSession() {
      const sessionId = this.$route.params.sessionId;
      try {
        const response = await fetch(`http://localhost:3000/api/voting-sessions/${sessionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          this.votingSession = result;
          this.timeRemaining = result.timeRemaining;
          this.totalVotes = result.votes ? result.votes.length : 0;
          this.calculateWinningMovie();
        } else {
          const errorData = await response.json();
          console.error('Erreur lors de la récupération de la session de vote:', errorData.error);
          alert(errorData.error);
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Erreur de récupération de la session de vote:', error);
      }
    },
    startCountdown() {
      const interval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining -= 1000;
        } else {
          clearInterval(interval);
          this.calculateWinningMovie();
        }
      }, 1000);
    },
    calculateWinningMovie() {
      if (this.votingSession && this.votingSession.votes && this.votingSession.votes.length > 0) {
        const voteCounts = this.votingSession.votes.reduce((acc, vote) => {
          acc[vote.movieListItemId] = (acc[vote.movieListItemId] || 0) + 1;
          return acc;
        }, {});
        const winningMovieId = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
        this.winningMovie = this.votingSession.movieList.items.find(item => item.id === parseInt(winningMovieId));
      }
    },
    formatTimeRemaining(timeRemaining) {
      const seconds = Math.floor((timeRemaining / 1000) % 60);
      const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
      const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

      return `${days}j ${hours}h ${minutes}m ${seconds}s`;
    },
    async voteForMovie() {
      const sessionId = this.$route.params.sessionId;
      try {
        const response = await fetch(`http://localhost:3000/api/voting-sessions/${sessionId}/vote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ movieListItemId: this.selectedMovieId }),
        });
        if (response.ok) {
          alert('Vote enregistré avec succès');
          await this.loadVotingSession();
        } else {
          const errorData = await response.json();
          console.error('Erreur lors de l\'enregistrement du vote:', errorData.error);
          alert(errorData.error);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du vote:', error);
      }
    },
    getProfilePictureUrl(path) {
      return path ? `http://localhost:3000${path}` : 'default-profile.png'; // Remplacez 'default-profile.png' par le chemin de votre image par défaut
    },
  },
};
</script>

<style scoped>

.vote-page-container {
  margin: 50px 200px 50px 200px;
}
.voting-session-header p {
  margin-bottom: 15px; /* Ajustez selon vos besoins */
}

/* Espace entre les sections principales */
.voting-session-details {
  display: flex; /* Flexbox pour aligner les éléments horizontalement */
  justify-content: space-between; /* Répartir l'espace entre les colonnes */
  width: 100%;
  margin-top: 20px; /* Espacement entre les sections */
}

.fa-user-group, .fa-clock {
  color: #5DF6FF;
  margin-right: 8px;
}

.voting-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-vote {
  width: 700px;
}

.result-vote h2 {
  margin-bottom: 30px; /* Espace sous le titre */
}

.result-vote p {
  margin: 30px 0; /* Espace entre chaque paragraphe */
}

.voting-session-details {
  display: flex;
  justify-content: center; /* Centrer les colonnes si nécessaire */
  width: 100%;
  max-width: 600px; /* Ajustez la largeur selon vos besoins */
}

.session-info {
  display: flex;
  justify-content: space-between; /* Espace entre les éléments dans la session */
  width: 100%; /* Remplir toute la largeur disponible */
}

.info-column {
  flex: 1; /* Chaque colonne prend une part égale de l'espace disponible */
  display: flex;
  justify-content: flex-start; /* Aligner le contenu à gauche */
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item i {
  margin-right: 8px; /* Espace entre l'icône et le texte */
  color: #555;
}


.result-vote, .form-vote {
  text-align: center;
  background-color: rgba(3, 8, 27, 0.3);
    height: auto;
    min-width: 450px;
    padding: 50px;
    border-radius: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.result-vote .winning-movie-title {
  font-size: 24px; /* Taille de police */
  font-weight: bold; /* Gras */
  text-transform: uppercase; /* Majuscules */
  margin-bottom: 10px; /* Ajoutez de l'espace si nécessaire */
}


.winning-icon {
  font-size: 60px;
}



/* Style pour les résultats des votes */

/* Conteneur du bouton radio et du label */
.movie-radio-container {
  display: flex;
  align-items: center;
  padding: 7px 30px 7px 30px; /* Un petit padding autour du conteneur */
  border-radius: 30px; /* Arrondir les coins */
  border: 2px solid transparent; /* Bordure transparente par défaut */
  transition: all 0.3s ease; /* Transition douce */
  cursor: pointer; /* Le curseur change quand on survole */
  margin-bottom: 10px; /* Espacement entre les éléments */
}

/* Masquer le bouton radio natif */
input[type="radio"] {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #5DF6FF; /* Bordure bleue par défaut */
  border-radius: 50%; /* Forme ronde */
  appearance: none; /* Retirer le style par défaut */
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease; /* Transition douce pour les changements de style */
  margin-right: 50px; /* Espacement entre le bouton radio et le label */
}

/* Lorsque le bouton radio est sélectionné */
input[type="radio"]:checked {
  background-color: #5DF6FF; /* Fond bleu */
  border: 2px solid #5DF6FF; /* Bordure bleue */
  box-shadow: 0 0 0 3px rgba(93, 246, 255, 0.3); /* Ombre bleue douce autour du bouton */
}

/* Quand le bouton radio est sélectionné et qu'on le survole */
input[type="radio"]:checked:hover {
  background-color: #4ec9e3; /* Couleur légèrement plus foncée au survol */
}

/* Appliquer la bordure bleue autour du conteneur (radio + label) quand le radio est sélectionné */
input[type="radio"]:checked {
  background-color: #5DF6FF; /* Fond bleu */
  border: 2px solid #5DF6FF; /* Bordure bleue */
  box-shadow: 0 0 0 3px rgba(93, 246, 255, 0.3); /* Ombre bleue douce autour du bouton */
}

/* Quand le bouton radio est sélectionné, appliquer la bordure bleue autour du conteneur entier (radio + label) */
.movie-radio-container.selected {
  border-color: #5DF6FF; /* Bordure bleue */
}

/* Style pour le label qui agit comme le texte du bouton */
.movie-label {
  font-size: 16px;
  transition: all 0.3s ease; /* Transition douce */
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 5px;
}

/* Quand on survole le label */
input[type="radio"]:not(:checked):hover + .movie-label {
  border-color: #5DF6FF; /* Bordure bleue au survol du label */
}

/* Style pour le bouton de soumission */
button[type="submit"] {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #5DF6FF;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

/* Changer la couleur du bouton au survol */
button[type="submit"]:hover {
  background-color: #4fc1e3;
}

/* Style pour les résultats des votes */
.voting-results ul {
  list-style-type: none;
  padding: 0;
}

.vote-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>