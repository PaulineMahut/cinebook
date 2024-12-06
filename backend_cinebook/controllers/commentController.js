import { createComment, findCommentsByTmdbId } from '../models/commentModel.js';

export const addCommentController = async (req, res) => {
  const { content, rating } = req.body;
  const userId = req.user.userId;
  const tmdbId = parseInt(req.params.tmdbId);

  try {
    const comment = await createComment({
      content,
      rating,
      userId,
      tmdbId,
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const getCommentsController = async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);

  try {
    const comments = await findCommentsByTmdbId(tmdbId);
    res.status(200).json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};