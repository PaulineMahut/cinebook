import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { findVotingSessionById, createVotingSession, findMovieListById, createVote, findVoteByUserAndSession, findMovieListItemById } from '../models/voteModel.js';
import { createManyNotifications } from '../models/notificationModel.js';

export const checkGroupMembership = async (req, res, next) => {
  const userId = req.user.userId;
  const sessionId = parseInt(req.params.sessionId);

  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    const votingSession = await findVotingSessionById(sessionId);

    if (!votingSession) {
      return res.status(404).json({ error: 'Session de vote non trouvée' });
    }

    const isMember = votingSession.movieList.sharedLists.some(sharedList =>
      sharedList.group.members.some(member => member.userId === userId)
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    req.votingSession = votingSession;
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'appartenance au groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'appartenance au groupe' });
  }
};

export const createVotingSessionController = async (req, res) => {
  const { movieListId, description, endTime } = req.body;
  const userId = req.user.userId;

  try {
    const movieList = await findMovieListById(movieListId);

    if (!movieList || movieList.userId !== userId) {
      return res.status(404).json({ error: 'Liste de films non trouvée ou accès non autorisé' });
    }

    // Vérifiez si la liste est partagée
    const sharedList = await prisma.sharedList.findFirst({
      where: { listId: movieListId },
    });

    if (!sharedList) {
      return res.status(400).json({ error: 'La liste doit être partagée avant de pouvoir lancer une session de vote' });
    }

    const votingSession = await createVotingSession({
      movieListId,
      description,
      endTime: new Date(endTime),
    });

    const notifications = movieList.sharedLists.flatMap(sharedList =>
      sharedList.group.members.map(member => ({
        userId: member.userId,
        senderId: userId,
        type: 'voting_session_started',
        status: 'unread',
        message: `Un vote a été lancé par ${movieList.user.pseudo} ! 
        Votez pour le film à regarder avec votre groupe <a href="/voting-sessions/${votingSession.id}">Voir le vote</a>`,
        votingSessionId: votingSession.id
      }))
    );

    await createManyNotifications(notifications);

    res.status(201).json(votingSession);
  } catch (error) {
    console.error('Erreur lors de la création de la session de vote:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de vote' });
  }
};

export const getVotingSessionDetailsController = async (req, res) => {
  try {
    const votingSession = req.votingSession;

    const now = new Date();
    const timeRemaining = Math.max(0, new Date(votingSession.endTime) - now);

    res.status(200).json({ ...votingSession, timeRemaining });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la session de vote:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de la session de vote' });
  }
};

export const voteForMovieController = async (req, res) => {
  const sessionId = parseInt(req.params.sessionId);
  const { movieListItemId } = req.body;
  const userId = req.user.userId;

  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    const votingSession = req.votingSession;

    const movieListItem = await findMovieListItemById(movieListItemId);

    if (!movieListItem || movieListItem.listId !== votingSession.movieListId) {
      return res.status(400).json({ error: 'Film non valide pour cette session de vote' });
    }

    const existingVote = await findVoteByUserAndSession(userId, sessionId);

    if (existingVote) {
      return res.status(400).json({ error: 'Vous avez déjà voté dans cette session de vote' });
    }

    const vote = await createVote({
      userId,
      votingSessionId: sessionId,
      movieListItemId
    });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Erreur lors du vote:', error);
    res.status(500).json({ error: 'Erreur lors du vote' });
  }
};