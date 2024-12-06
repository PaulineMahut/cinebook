import express from 'express';
import { getAllUsersController, getUserProfileController, updateUserProfileController, getUserProfileByIdController } from '../controllers/userController.js';
import authenticateJWT from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/users', authenticateJWT, getAllUsersController);
router.get('/user/profile', authenticateJWT, getUserProfileController);
router.put('/user/profile', authenticateJWT, upload.single('profilePicture'), updateUserProfileController);
router.get('/user/profile/:id', getUserProfileByIdController);

export default router;