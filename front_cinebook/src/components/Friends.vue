<template>
    <div>
        <h1>Liste des amis</h1>
        <ul>
            <li v-for="friend in friends" :key="friend.id">
                {{ friend.pseudo }} ({{ friend.email }})
                <!-- Bouton pour supprimer l'ami -->
                <button @click="removeFriend(friend.id)">Supprimer</button>
            </li>
        </ul>
        <p v-if="!friends.length">Aucun ami trouvé.</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            friends: [], // Liste des amis
        };
    },
    async mounted() {
        const userId = this.$route.params.id; // Récupérer l'ID de l'utilisateur dont on veut afficher les amis
        try {
            const response = await fetch(`http://localhost:3000/api/friends/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const friendsData = await response.json();
                this.friends = friendsData; // Charger la liste d'amis
            } else {
                console.error('Erreur lors de la récupération des amis');
            }
        } catch (error) {
            console.error('Erreur de récupération de la liste d\'amis:', error);
        }
    },
    methods: {
        async removeFriend(friendId) {
            try {
                const response = await fetch('http://localhost:3000/api/friends/remove', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ friendId }), // Envoyer l'ID de l'ami à supprimer
                });
                if (response.ok) {
                    this.friends = this.friends.filter(friend => friend.id !== friendId); // Mise à jour de la liste après suppression
                    alert('Ami retiré avec succès');
                } else {
                    const errorData = await response.json();
                    alert('Erreur lors de la suppression de l\'ami : ' + errorData.error);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'ami:', error);
            }
        }
    }
};
</script>
