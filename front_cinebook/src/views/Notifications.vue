<template>
  <div>
    <h1>Notifications</h1>
    <ul v-if="notifications.length">
      <li v-for="notification in notifications" :key="notification.id">
        <p v-if="notification.message" v-html="notification.message"></p>
        <p v-else-if="notification.type === 'friend_request' && notification.status === 'pending'">
          {{ notification.sender.pseudo }} vous a envoyé une demande d'ami.
          <button @click="respondToFriendRequest(notification.id, 'accepted')">Accepter</button>
          <button @click="respondToFriendRequest(notification.id, 'rejected')">Refuser</button>
        </p>
        <p v-else-if="notification.type === 'group_invitation' && notification.status === 'pending'">
          {{ notification.sender.pseudo }} vous a invité à rejoindre le groupe {{ notification.group?.name }}.
          <button @click="respondToGroupInvitation(notification.id, 'accepted', notification)">Accepter</button>
          <button @click="respondToGroupInvitation(notification.id, 'rejected', notification)">Refuser</button>
        </p>
        <p v-else-if="notification.type === 'user_joined_group'">
          {{ notification.message }}
        </p>
        <p v-else-if="notification.type === 'friend_accepted'">
          {{ notification.message }}
        </p>
        <p v-else-if="notification.type === 'list_shared'">
          {{ notification.sender.pseudo }} a partagé la liste "{{ notification.list?.name }}" avec le groupe "{{ notification.group?.name }}".
        </p>
        <p v-else-if="notification.type === 'voting_session_started'">
          {{ notification.message }} <router-link :to="'/voting-sessions/' + notification.votingSessionId">Voir le vote</router-link>
        </p>
      </li>
    </ul>
    <p v-else>Aucune notification pour l'instant.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: [],
    };
  },
  async mounted() {
    await this.loadNotifications();
  },
  methods: {
    async loadNotifications() {
      try {
        const response = await fetch('http://localhost:3000/api/notifications', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.notifications = await response.json();
        } else {
          console.error('Erreur lors de la récupération des notifications');
        }
      } catch (error) {
        console.error('Erreur de récupération des notifications:', error);
      }
    },
    async respondToFriendRequest(notificationId, response) {
      try {
        const res = await fetch('http://localhost:3000/api/notifications/respond', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId, response }), // 'accepted' ou 'rejected'
        });

        if (res.ok) {
          const result = await res.json();
          alert(result.message || 'Réponse à la demande d\'ami envoyée avec succès');
          
          // Retirer la notification de la liste
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          // Ajouter une notification pour indiquer que les utilisateurs sont désormais amis
          if (response === 'accepted') {
            this.notifications.push({
              id: Date.now(), // Créer un ID unique pour cette notification
              type: 'friend_accepted',
              message: `Vous êtes maintenant amis avec ${result.sender.pseudo}.`,
            });
          }
        } else {
          console.error('Erreur lors de l\'envoi de la réponse à la demande d\'ami');
        }
      } catch (error) {
        console.error('Erreur lors de la réponse à la demande d\'ami:', error);
      }
    },
    async respondToGroupInvitation(notificationId, response, originalNotification) {
      const groupId = originalNotification.group.id; // Récupérer l'ID du groupe à partir de la notification

      try {
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/invitations/respond`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ response }), // 'accepted' ou 'rejected'
        });

        if (res.ok) {
          alert('Réponse envoyée avec succès');
          
          // Retirer la notification acceptée de la liste
          if (response === 'accepted') {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            // Ajouter une notification pour indiquer que l'utilisateur a rejoint le groupe
            this.notifications.push({
              id: Date.now(), // Créer un ID unique pour cette notification
              type: 'user_joined_group',
              message: `Vous avez rejoint le groupe ${originalNotification.group.name}.`,
            });
          } else {
            // Retirer la notification rejetée de la liste
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
          }
        } else {
          console.error('Erreur lors de l\'envoi de la réponse à l\'invitation');
        }
      } catch (error) {
        console.error('Erreur lors de la réponse à la notification:', error);
      }
    },
  },
};
</script>