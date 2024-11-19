<template>
    <div class="profile-page">
        <!-- Recherche d'utilisateurs -->
        <div class="search-section">
            <h2>Explorez notre communauté !</h2>
            <div class="search-bar-user">
                <i class="fas fa-search"></i>
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Rechercher un utilisateur..."
                    @input="searchUsers"
                    class="input-search"
                />
            </div>

            <!-- Afficher les résultats de recherche seulement si au moins 2 caractères sont saisis -->
            <ul v-if="searchResults.length">
                <li v-for="user in searchResults" :key="user.id" class="user-item">
                    <img :src="getProfilePictureUrl(user.profilePicture)" alt="Profile Picture" class="profile-picture"/>
                    <router-link :to="`/user/${user.id}`"> <!-- Lien vers le profil utilisateur -->
                        {{ user.pseudo }} {{ user.email }}  <!-- Affiche le pseudo -->
                    </router-link>
                    <button @click="viewProfile(user.id)">Voir profil</button>
                </li>
            </ul>
            <p v-else-if="searchQuery.length >= 2 && !searchResults.length">
                Aucun utilisateur trouvé
            </p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            searchQuery: '', // La requête de recherche
            searchResults: [], // Les résultats de la recherche
        };
    },
    methods: {
        // Méthode pour rechercher des utilisateurs
        async searchUsers() {
            // Ne lancer la recherche que si la saisie fait au moins 2 caractères
            if (this.searchQuery.length < 2) {
                this.searchResults = []; // Réinitialiser les résultats si la recherche est inférieure à 2 caractères
                return;
            }

            console.log('Searching for users with query:', this.searchQuery); // Log de la requête

            try {
                const response = await fetch(`http://localhost:3000/api/users?search=${this.searchQuery}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la recherche des utilisateurs');
                }

                const data = await response.json();
                console.log('Users found:', data); // Log des résultats
                this.searchResults = data; // Stocker les résultats de la recherche
            } catch (error) {
                console.error('Erreur lors de la recherche des utilisateurs:', error);
            }
        },
        viewProfile(userId) {
            this.$router.push(`/user/${userId}`);
        },
        getProfilePictureUrl(path) {
            if (!path) {
                return 'http://localhost:3000/images/user_defaut.png'; // Chemin de l'image par défaut
            }
            if (path.startsWith('/images/')) {
                return `http://localhost:3000${path}`;
            } else if (path.startsWith('/uploads/')) {
                return `http://localhost:3000${path}`;
            } else {
                return `http://localhost:3000/uploads/${path}`;
            }
        }
    },
};
</script>

<style scoped>
/* Vous pouvez ajouter des styles ici pour améliorer la présentation */
.profile-page {
    margin-top: 100px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.search-section {
    width: 100%;
    max-width: 600px;
    text-align: center;
}

.search-section h2 {
    margin-bottom: 50px;
}

.search-bar-user {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ccc; /* Ligne en dessous */
    padding-bottom: 5px;
    margin-bottom: 25px;
}

.input-search {
    margin-left: 20px !important;
}

.search-bar-user .fa-search {
    font-size: 50px;
}

.search-bar-user input {
    flex: 1;
    border: none;
    outline: none;
}

ul {
    list-style-type: none;
    padding-left: 0;
}

li {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.profile-picture {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 45px;
}

button {
    margin-left: auto;
}

.user-item button {
    background-color: #00ADB5;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
</style>