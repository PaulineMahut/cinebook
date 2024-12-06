import { PrismaClient } from '@prisma/client';
import {
  createMovieList, addMovieToList, getMovieListsByUserId, getMovieListById, updateMovieList, deleteMovieList, deleteMovieFromList,
  shareMovieList, getSharedListsByUserId, getSharedListsByGroupId
} from '../models/movieListModel.js';

const prisma = new PrismaClient();

export const createMovieListController = async (req, res) => {
  const userId = req.user.userId;
  const { name, description } = req.body;

  try {
    const movieList = await createMovieList({
      name,
      description,
      userId,
    });

    res.status(201).json(movieList);
  } catch (error) {
    console.error('Error creating movie list:', error);
    res.status(500).json({ error: 'Failed to create movie list' });
  }
};

export const addMovieToListController = async (req, res) => {
  const listId = parseInt(req.params.listId);
  const { title, overview, voteAverage, tmdbId } = req.body;

  try {
    const movieListItem = await addMovieToList(listId, {
      title,
      overview,
      voteAverage,
      tmdbId,
    });

    res.status(201).json(movieListItem);
  } catch (error) {
    console.error('Error adding movie to list:', error);
    res.status(500).json({ error: 'Failed to add movie to list' });
  }
};

export const getMovieListsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const movieLists = await getMovieListsByUserId(userId);
    res.status(200).json(movieLists);
  } catch (error) {
    console.error('Error retrieving movie lists:', error);
    res.status(500).json({ error: 'Failed to retrieve movie lists' });
  }
};

export const getMovieListController = async (req, res) => {
  const listId = parseInt(req.params.id);

  try {
    const movieList = await getMovieListById(listId);

    if (!movieList) {
      return res.status(404).json({ error: 'Movie list not found' });
    }

    res.status(200).json(movieList);
  } catch (error) {
    console.error('Error retrieving movie list details:', error);
    res.status(500).json({ error: 'Failed to retrieve movie list details' });
  }
};

export const deleteMovieListController = async (req, res) => {
  const listId = parseInt(req.params.listId);

  try {
    await deleteMovieList(listId);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste de films:', error);
    res.status(500).json({ error: 'Impossible de supprimer la liste de films' });
  }
};

export const deleteMovieFromListController = async (req, res) => {
  const itemId = parseInt(req.params.itemId);

  try {
    await deleteMovieFromList(itemId);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du film de la liste:', error);
    res.status(500).json({ error: 'Impossible de supprimer le film de la liste' });
  }
};

export const shareMovieListController = async (req, res) => {
  const listId = parseInt(req.params.listId);
  const { groupId } = req.body;
  const userId = req.user.userId;

  if (!groupId) {
    return res.status(400).json({ error: 'groupId est requis' });
  }

  try {
    const list = await getMovieListById(listId);

    if (!list || list.userId !== userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à partager cette liste' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }

    const existingShare = await prisma.sharedList.findFirst({
      where: { listId, groupId },
    });

    if (existingShare) {
      return res.status(409).json({ error: 'La liste est déjà partagée avec ce groupe' });
    }

    const sharedList = await prisma.sharedList.create({
      data: {
        listId,
        groupId,
      },
    });

    const groupMembers = await prisma.groupMembership.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const notifications = groupMembers.map(member => ({
      userId: member.userId,
      senderId: userId,
      type: 'list_shared',
      status: 'unread',
      groupId: groupId,
      listId: listId,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.status(201).json(sharedList);
  } catch (error) {
    console.error('Erreur lors du partage de la liste:', error);
    res.status(500).json({ error: 'Impossible de partager la liste' });
  }
};

export const getSharedListsByUserIdController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const sharedLists = await getSharedListsByUserId(userId);
    res.status(200).json(sharedLists);
  } catch (error) {
    console.error('Erreur lors de la récupération des listes partagées:', error);
    res.status(500).json({ error: 'Impossible de récupérer les listes partagées' });
  }
};

export const getSharedListsByGroupIdController = async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.userId;

  try {
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Vous n\'êtes pas membre de ce groupe' });
    }

    const sharedLists = await getSharedListsByGroupId(groupId);
    res.status(200).json(sharedLists);
  } catch (error) {
    console.error('Erreur lors de la récupération des listes partagées:', error);
    res.status(500).json({ error: 'Impossible de récupérer les listes partagées' });
  }
};

export const isListSharedWithGroupController = async (req, res) => {
  const listId = parseInt(req.params.listId);

  try {
    const existingShare = await prisma.sharedList.findMany({
      where: { listId },
    });

    if (existingShare.length > 0) {
      return res.status(200).json({ isShared: true });
    } else {
      return res.status(200).json({ isShared: false });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du partage de la liste:', error);
    res.status(500).json({ error: 'Impossible de vérifier le partage de la liste' });
  }
};