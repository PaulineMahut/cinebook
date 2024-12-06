import express from 'express';
import { sendNotificationController, getNotificationsController, respondToNotificationController } from '../controllers/notificationController.js';
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/notifications/send', authenticateJWT, sendNotificationController);
router.get('/notifications', authenticateJWT, getNotificationsController);
router.post('/notifications/respond', authenticateJWT, respondToNotificationController);

export default router;