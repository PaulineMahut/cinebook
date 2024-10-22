<template>
  <div>
    <h1>Notifications</h1>
    <ul v-if="notifications.length">
      <li v-for="notification in notifications" :key="notification.id">
        <p v-if="notification.type === 'friend_request'">
          {{ notification.sender.pseudo }} vous a envoyé une demande d'ami.
        </p>
        <p v-else-if="notification.type === 'group_invitation'">
          {{ notification.sender.pseudo }} vous a invité à rejoindre le groupe {{ notification.group.name }}.
        </p>
        <button @click="respondToNotification(notification.id, 'accepted')">Accepter</button>
        <button @click="respondToNotification(notification.id, 'rejected')">Refuser</button>
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
    async respondToNotification(notificationId, response) {
      try {
        const res = await fetch('http://localhost:3000/api/notifications/respond', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId, response }),
        });

        if (res.ok) {
          alert('Réponse envoyée avec succès');
          await this.loadNotifications(); // Rechargez les notifications après la réponse
        } else {
          console.error('Erreur lors de l\'envoi de la réponse');
        }
      } catch (error) {
        console.error('Erreur lors de la réponse à la notification:', error);
      }
    },
  },
};
</script>