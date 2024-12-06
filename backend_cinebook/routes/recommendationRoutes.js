import express from 'express';
import { getRecommendationsController } from '../controllers/recommendationController.js';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

router.get('/recommendations', authenticateJWT, getRecommendationsController);

export default router;