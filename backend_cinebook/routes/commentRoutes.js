import express from 'express';
import { addCommentController, getCommentsController } from '../controllers/commentController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/movies/:tmdbId/comments', authenticateJWT, addCommentController);
router.get('/movies/:tmdbId/comments', getCommentsController);

export default router;