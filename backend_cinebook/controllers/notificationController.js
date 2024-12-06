import { createNotification, createManyNotifications, findNotificationsByUserId, findNotificationById, deleteNotificationById } from '../models/notificationModel.js';
import { findUserById } from '../models/userModel.js';
import { findGroupById } from '../models/groupModel.js';
import { findMovieListById } from '../models/movieListModel.js';
import { findGroupMemberships } from '../models/groupMembershipModel.js';
import { findFriendship, createFriendship } from '../models/friendModel.js';

export const sendNotificationController = async (req, res) => {
  const { recipientId, type, groupId, listId } = req.body;
  const senderId = req.user.userId;

  try {
    if (type === 'group_invitation') {
      const group = await findGroupById(groupId);

      if (!group) {
        return res.status(404).json({ error: 'Groupe non trouvé' });
      }

      if (group.creatorId !== senderId) {
        return res.status(403).json({ error: 'Non autorisé à inviter des membres dans ce groupe' });
      }

      const notification = await createNotification({
        userId: recipientId,
        senderId: senderId,
        type: 'group_invitation',
        groupId: groupId,
      });

      return res.status(201).json(notification);
    } else if (type === 'list_shared') {
      const list = await findMovieListById(listId);
      const group = await findGroupById(groupId);

      if (!list || !group) {
        return res.status(404).json({ error: 'Liste ou groupe non trouvé' });
      }

      const groupMembers = await findGroupMemberships(groupId);

      const notifications = groupMembers.map(member => ({
        userId: member.userId,
        senderId: senderId,
        type: 'list_shared',
        status: 'unread',
        groupId: groupId,
        listId: listId,
      }));

      await createManyNotifications(notifications);

      return res.status(201).json({ message: 'Notifications de partage de liste créées' });
    }

    const notification = await createNotification({
      userId: recipientId,
      senderId: senderId,
      type: type || 'friend_request',
      status: 'pending',
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    res.status(500).json({ error: 'Impossible d\'envoyer la notification' });
  }
};

export const getNotificationsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await findNotificationsByUserId(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ error: 'Échec de la récupération des notifications' });
  }
};

export const respondToNotificationController = async (req, res) => {
  const { notificationId, response } = req.body;
  const userId = req.user.userId;

  try {
    const notification = await findNotificationById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    if (response === 'accepted') {
      if (notification.type === 'friend_request') {
        const existingFriendship = await findFriendship(userId, notification.senderId);

        if (!existingFriendship) {
          await createFriendship(userId, notification.senderId);
          await createFriendship(notification.senderId, userId);
        }

        const accepter = await findUserById(userId);
        const sender = await findUserById(notification.senderId);

        await createManyNotifications([
          {
            userId: notification.senderId,
            senderId: userId,
            type: 'friend_accepted',
            status: 'unread',
            message: `Vous êtes maintenant amis avec <a href="/profile/${userId}">${accepter.pseudo}</a>.`
          },
          {
            userId: userId,
            senderId: notification.senderId,
            type: 'friend_accepted',
            status: 'unread',
            message: `Vous êtes maintenant amis avec <a href="/user/${notification.sender.id}">${sender.pseudo}</a>.`
          }
        ]);

        await deleteNotificationById(notificationId);

        res.status(200).json({ message: 'Demande d\'ami acceptée', accepter, sender });
      } else if (notification.type === 'group_invitation') {
        await prisma.groupMembership.create({
          data: {
            groupId: notification.groupId,
            userId: userId,
          },
        });

        await createNotification({
          userId: notification.senderId,
          senderId: userId,
          type: 'user_joined_group',
          status: 'unread',
          groupId: notification.groupId,
          message: `${notification.sender.pseudo} a rejoint le groupe ${notification.group.name}.`
        });

        await deleteNotificationById(notificationId);

        res.status(200).json({ message: 'Invitation au groupe acceptée, membre ajouté au groupe' });
      }
    } else {
      await deleteNotificationById(notificationId);
      res.status(200).json({ message: 'Notification rejetée' });
    }
  } catch (error) {
    console.error('Erreur lors de la réponse à la notification:', error);
    res.status(500).json({ error: 'Erreur lors de la réponse à la notification' });
  }
};