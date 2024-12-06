import express from 'express';
import { createGroupController, getGroupsByUserIdController, getGroupByIdController, updateGroupController, deleteGroupController, respondToGroupInvitationController } from '../controllers/groupController.js';
import authenticateJWT from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/groups', authenticateJWT, upload.single('coverPhoto'), createGroupController);
router.get('/user/groups', authenticateJWT, getGroupsByUserIdController);
router.get('/groups/:id', authenticateJWT, getGroupByIdController);
router.put('/groups/:id', authenticateJWT, upload.single('coverPhoto'), updateGroupController);
router.delete('/groups/:id', authenticateJWT, deleteGroupController);
router.post('/groups/:groupId/invitations/respond', authenticateJWT, respondToGroupInvitationController);

export default router;