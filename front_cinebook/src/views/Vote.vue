<template>
  <div>
    <h1>Vote pour un film</h1>
    <div v-if="votingSession">
      <p v-if="votingSession.movieList.user">Un vote a été lancé par {{ votingSession.movieList.user.pseudo }}!</p>
      <p>{{ votingSession.description }}</p>
      <p>Temps restant : {{ formatTimeRemaining(timeRemaining) }}</p>
      <p>Nombre total de votes : {{ totalVotes }}</p>
      <div v-if="timeRemaining > 0">
        <form @submit.prevent="voteForMovie">
          <div v-for="item in votingSession.movieList.items" :key="item.id">
            <input type="radio" :id="item.id" :value="item.id" v-model="selectedMovieId" required />
            <label :for="item.id">{{ item.title }}</label>
          </div>
          <button type="submit">Voter</button>
        </form>
      </div>
      <div v-else>
        <h2>Le vote est terminé!</h2>
        <p v-if="winningMovie">{{ winningMovie.title }} a remporté le vote</p>
        <p v-else>Aucun vote n'a été enregistré</p>
      </div>
      <div v-if="votingSession.votes && votingSession.votes.length">
        <h2>Résultats des votes</h2>
        <ul>
          <li v-for="vote in votingSession.votes" :key="vote.id">
            {{ vote.user.pseudo }} a voté pour {{ vote.movieListItem.title }}
          </li>
        </ul>
      </div>
    </div>
    <p v-else>Chargement des détails de la session de vote...</p>
  </div>
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
  },
};
</script>