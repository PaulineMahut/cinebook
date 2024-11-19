<template>
  <div class="container-page-notification">
    <h1>Notifications</h1>
    <div v-if="notifications.length">
      <div v-for="(section, index) in groupedNotifications" :key="index">
        <h2>{{ section.title }}</h2>
        <ul class="list-notif">
          <li v-for="notification in section.notifications" :key="notification.id">
            <h3>{{ getNotificationTitle(notification.type) }}</h3>
            <p class="time-notif-ago">{{ getTimeAgo(notification.createdAt) }}</p>
            <p v-if="notification.message" v-html="notification.message"></p>
            <p v-else-if="notification.type === 'friend_request' && notification.status === 'pending'">
              {{ notification.sender.pseudo }} vous a envoyé une demande d'ami.
              <div class="choice-container">
                <button @click="respondToFriendRequest(notification.id, 'accepted')" class="accepted-button">Accepter</button>
                <button @click="respondToFriendRequest(notification.id, 'rejected')" class="rejected-button">Refuser</button>
              </div>
            </p>
            <p v-else-if="notification.type === 'group_invitation' && notification.status === 'pending'">
              {{ notification.sender.pseudo }} vous a invité à rejoindre le groupe 
              <router-link :to="'/groups/' + notification.group.id">{{ notification.group.name }}</router-link>.
              <div class="choice-container">
              <button @click="respondToGroupInvitation(notification.id, 'accepted', notification)" class="accepted-button">Accepter</button>
              <button @click="respondToGroupInvitation(notification.id, 'rejected', notification)" class="rejected-button">Refuser</button>
              </div>
            </p>
            <p v-else-if="notification.type === 'user_joined_group'">
              {{ notification.message }}
            </p>
            <p v-else-if="notification.type === 'friend_accepted'">
              {{ notification.message }}
            </p>
            <p v-else-if="notification.type === 'list_shared'">
              {{ notification.sender.pseudo }} a partagé la liste 
              <span v-if="notification.list">
                <router-link :to="'/movie-list/' + notification.list.id">{{ notification.list.name }}</router-link>
              </span>
              <span v-else>
                (Liste supprimée)
              </span>
              avec le groupe 
              <router-link :to="'/group/' + notification.group.id">{{ notification.group.name }}</router-link>.
            </p>
            <p v-else-if="notification.type === 'voting_session_started'">
              {{ notification.message }} 
              <router-link :to="'/voting-sessions/' + notification.votingSessionId">Voir le vote</router-link>
            </p>
          </li>
        </ul>
      </div>
    </div>
    <p v-else>Aucune notification pour l'instant.</p>
  </div>
</template>

<script>
import { formatDistanceToNow, isToday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export default {
  data() {
    return {
      notifications: [],
    };
  },
  computed: {
    groupedNotifications() {
      const today = [];
      const thisWeek = [];
      const older = [];

      const sortedNotifications = [...this.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      sortedNotifications.forEach(notification => {
        const createdAt = new Date(notification.createdAt);
        if (isToday(createdAt)) {
          today.push(notification);
        } else if (isThisWeek(createdAt)) {
          thisWeek.push(notification);
        } else {
          older.push(notification);
        }
      });

      return [
        { title: 'Aujourd\'hui', notifications: today },
        { title: 'Cette semaine', notifications: thisWeek },
        { title: 'Plus ancien', notifications: older },
      ];
    },
  },
  async mounted() {
    await this.loadNotifications();
  },
  methods: {
    getTimeAgo(date) {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
    },
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
              createdAt: new Date().toISOString(), // Ajoutez la date de création
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
              createdAt: new Date().toISOString(), // Ajoutez la date de création
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
    getNotificationTitle(type) {
      switch (type) {
        case 'friend_request':
          return 'Demande d\'ami';
        case 'group_invitation':
          return 'Invitation à un groupe';
        case 'user_joined_group':
          return 'Utilisateur a rejoint le groupe';
        case 'friend_accepted':
          return 'Ami accepté';
        case 'list_shared':
          return 'Partage de liste';
        case 'voting_session_started':
          return 'A vos votes !';
        default:
          return 'Notification';
      }
    },
  },
};
</script>

<style>

.container-page-notification {
  margin-top: 50px;
}

.container-page-notification h1 {
  text-align-last: center;
  margin-bottom: 50px;
}

.container-page-notification h2 {
  color: #ffffff52;
  margin-bottom: 30px;
  margin-top: 50px;
}

.list-notif {
  list-style-type: none;
  padding: 0;
}

.list-notif li {
  background-color: #ffffff0d;
  margin: 10px;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ffffff1f;
  border-radius: 13px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

}

.time-notif-ago {
  color: #ffffff8a;
  font-size: 14px;
  margin-bottom: 10px;
}

.choice-container .accepted-button {
  background-color: #00ADB5;
}

.choice-container .accepted-button:hover {
  background-color: #00adb5eb;
}

.choice-container .rejected-button:hover {
  background-color: #ffffff0e;
}



.choice-container .rejected-button {
  border: 1px solid #ffffff8a;
}

.choice-container button {
  padding: 7px 20px;
  margin: 10px;
  border-radius: 7px;
}
</style>