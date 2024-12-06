import express from 'express';
import { sendFriendRequestController, removeFriendController, getFriendsController, getUserFriendsController } from '../controllers/friendController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/friends/add', authenticateJWT, sendFriendRequestController);
router.delete('/friends/remove', authenticateJWT, removeFriendController);
router.get('/friends', authenticateJWT, getFriendsController);
router.get('/friends/:userId', authenticateJWT, getUserFriendsController);

export default router;