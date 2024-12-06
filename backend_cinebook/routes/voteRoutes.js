import express from 'express';
import { createVotingSessionController, getVotingSessionDetailsController, voteForMovieController, checkGroupMembership } from '../controllers/voteController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/voting-sessions', authenticateJWT, createVotingSessionController);
router.get('/voting-sessions/:sessionId', authenticateJWT, checkGroupMembership, getVotingSessionDetailsController);
router.post('/voting-sessions/:sessionId/vote', authenticateJWT, checkGroupMembership, voteForMovieController);

export default router;