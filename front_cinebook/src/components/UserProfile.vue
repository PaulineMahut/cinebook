<template>
    <div>
      <h1>Profil de l'utilisateur</h1>
      <p>Email : {{ user.email }}</p>
      <p>Pseudo : {{ user.pseudo }}</p>
      <p>Nombre d'amis : <router-link :to="{ name: 'friends', params: { id: userId } }">{{ friendCount }}</router-link></p>
      <button @click="addFriend" v-if="!isFriend">Ajouter en ami</button>
      <button @click="removeFriend" v-if="isFriend">Retirer de mes amis</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                email: '',
                pseudo: '',
            },
            friendCount: 0, // Compteur d'amis
            isFriend: false, // Indique si l'utilisateur connecté est déjà ami
            userId: null // Ajout de userId ici
        };
    },
    async mounted() {
        this.userId = this.$route.params.id; // Affecter la valeur de userId
        await this.loadUserProfile();
    },
    methods: {
        async addFriend() {
            const friendId = parseInt(this.userId); // Utilisation de this.userId
            try {
                const response = await fetch('http://localhost:3000/api/friends/add', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ friendId }),
                });
                if (response.ok) {
                    this.isFriend = true;
                    alert('Ami ajouté avec succès');
                    await this.loadUserProfile(); // Rechargez le profil après ajout
                } else {
                    const errorData = await response.json();
                    alert(errorData.error);
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'ami:', error);
            }
        },

        async removeFriend() {
            const friendId = parseInt(this.userId); // Utilisation de this.userId
            try {
                const response = await fetch('http://localhost:3000/api/friends/remove', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ friendId }),
                });
                if (response.ok) {
                    this.isFriend = false;
                    alert('Ami retiré avec succès');
                    await this.loadUserProfile(); // Rechargez le profil après suppression
                } else {
                    const errorData = await response.json();
                    alert(errorData.error);
                }
            } catch (error) {
                console.error('Erreur lors du retrait de l\'ami:', error);
            }
        },

        async checkIfFriend(friendId) {
            try {
                const response = await fetch(`http://localhost:3000/api/friends`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.ok) {
                    const friends = await response.json();
                    this.isFriend = friends.some(friend => friend.id === parseInt(friendId));
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'amitié:', error);
            }
        },

        async loadUserProfile() {
            const userId = this.userId; // Utilisation de this.userId
            try {
                const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    this.user = userData; // L'utilisateur est mis à jour
                    this.friendCount = userData.friendCount; // Nombre d'amis mis à jour
                    this.checkIfFriend(userId);
                } else {
                    console.error('Erreur lors de la récupération des données utilisateur');
                }
            } catch (error) {
                console.error('Erreur de récupération du profil utilisateur:', error);
            }
        },
    },
};
</script>
