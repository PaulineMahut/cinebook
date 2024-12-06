import { createGroup, getGroupsByUserId, getGroupById, updateGroup, deleteGroup, addGroupMembership, deleteGroupMemberships, getGroupMemberships, findGroupMembership } from '../models/groupModel.js';
import { createNotification, createManyNotifications, deleteNotificationById, findGroupInvitation } from '../models/notificationModel.js';

export const createGroupController = async (req, res) => {
  const { name, description, members } = req.body;
  const creatorId = req.user.userId;
  let coverPhoto = null;

  if (req.file) {
    coverPhoto = `/uploads/${req.file.filename}`;
  }

  try {
    const parsedMembers = JSON.parse(members);

    const group = await createGroup({
      name,
      description,
      creatorId,
      coverPhoto,
      members: {
        create: {
          userId: creatorId,
        },
      },
    });

    const notifications = parsedMembers.map(memberId => ({
      userId: memberId,
      senderId: creatorId,
      type: 'group_invitation',
      status: 'pending',
      groupId: group.id,
    }));

    await createManyNotifications(notifications);

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getGroupsByUserIdController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const groups = await getGroupsByUserId(userId);
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error retrieving user groups:', error);
    res.status(500).json({ error: 'Failed to retrieve user groups' });
  }
};

export const getGroupByIdController = async (req, res) => {
  const groupId = parseInt(req.params.id);

  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'Invalid group ID' });
  }

  try {
    const group = await getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('Error retrieving group details:', error);
    res.status(500).json({ error: 'Failed to retrieve group details' });
  }
};

export const updateGroupController = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { name, description, members } = req.body;
  const userId = req.user.userId;
  let coverPhoto = null;

  if (req.file) {
    coverPhoto = `/uploads/${req.file.filename}`;
  }

  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'Invalid group ID' });
  }

  try {
    const group = await getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creatorId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier ce groupe' });
    }

    const updatedGroup = await updateGroup(groupId, {
      name,
      description,
      coverPhoto: coverPhoto || group.coverPhoto,
    });

    const currentMembers = await getGroupMemberships(groupId);
    const currentMemberIds = currentMembers.map(member => member.userId);
    const newMemberIds = JSON.parse(members);

    const membersToRemove = currentMemberIds.filter(id => !newMemberIds.includes(id));
    await deleteGroupMemberships(groupId, membersToRemove);

    const membersToAdd = newMemberIds.filter(id => !currentMemberIds.includes(id));
    await addGroupMembership(membersToAdd.map(userId => ({
      groupId: groupId,
      userId: userId,
    })));

    const notifications = membersToAdd.map(memberId => ({
      userId: memberId,
      senderId: userId,
      type: 'group_invitation',
      status: 'pending',
      groupId: groupId,
    }));

    await createManyNotifications(notifications);

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du groupe' });
  }
};

export const deleteGroupController = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const userId = req.user.userId;

  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'Invalid group ID' });
  }

  try {
    const group = await getGroupById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creatorId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce groupe' });
    }

    await deleteGroup(groupId);

    res.status(200).json({ message: 'Groupe supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du groupe' });
  }
};

export const respondToGroupInvitationController = async (req, res) => {
  const { response } = req.body;
  const userId = req.user.userId;
  const groupId = parseInt(req.params.groupId);

  try {
    const invitation = await findGroupInvitation(userId, groupId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation non trouvée ou déjà traitée' });
    }

    if (response === 'accepted') {
      await addGroupMembership({
        groupId: groupId,
        userId: userId,
      });

      await createNotification({
        userId: userId,
        senderId: invitation.senderId,
        type: 'user_joined_group',
        status: 'unread',
        groupId: groupId,
        message: `Vous avez rejoint le groupe <a href="/group/${groupId}">${invitation.group.name}</a>.`,
      });

      await createNotification({
        userId: invitation.senderId,
        senderId: userId,
        type: 'user_joined_group',
        status: 'unread',
        groupId: groupId,
        message: `${invitation.sender.pseudo} a accepté l'invitation à rejoindre le groupe <a href="/group/${groupId}">${invitation.group.name}</a>.`,
      });

      await deleteNotificationById(invitation.id);

      res.status(200).json({ message: 'Invitation au groupe acceptée, membre ajouté au groupe' });
    } else if (response === 'rejected') {
      await deleteNotificationById(invitation.id);

      res.status(200).json({ message: 'Invitation au groupe rejetée' });
    } else {
      res.status(400).json({ error: 'Réponse non valide' });
    }
  } catch (error) {
    console.error('Erreur lors de la réponse à l\'invitation de groupe:', error);
    res.status(500).json({ error: 'Impossible de traiter la réponse' });
  }
};