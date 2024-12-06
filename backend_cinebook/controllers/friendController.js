import { findUserById, findFriendship, createNotification, deleteFriendship, findFriends } from '../models/friendModel.js';

export const sendFriendRequestController = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;

  try {
    const friend = await findUserById(friendId);

    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFriendship = await findFriendship(userId, friendId);

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship already exists' });
    }

    await createNotification(friendId, userId, 'friend_request');

    res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
};

export const removeFriendController = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;

  try {
    const friendship = await findFriendship(userId, friendId);

    if (!friendship) {
      return res.status(404).json({ error: 'Cette amitié n\'existe pas' });
    }

    await deleteFriendship(userId, friendId);

    res.status(200).json({ message: 'Ami supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'ami:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'ami' });
  }
};

export const getFriendsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const friends = await findFriends(userId);

    const friendList = friends.map(friendship => ({
      id: friendship.friend.id,
      email: friendship.friend.email,
      pseudo: friendship.friend.pseudo,
    }));

    res.status(200).json(friendList);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

export const getUserFriendsController = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const friends = await findFriends(userId);

    const friendList = friends.map(friendship => ({
      id: friendship.friend.id,
      email: friendship.friend.email,
      pseudo: friendship.friend.pseudo,
    }));

    res.status(200).json(friendList);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
};