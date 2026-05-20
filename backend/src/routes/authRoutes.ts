import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, updateProfile, getProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.patch('/profile/edit', protect, updateProfile);
router.get('/profile', protect, getProfile);

export default router;