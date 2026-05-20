import { Router } from 'express';
import { addToCart, getMyCart, removeFromCart, updateCartQuantity } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect); // All cart actions require login

router.get('/', getMyCart);
router.post('/', addToCart);
router.delete('/:id', removeFromCart);
router.patch('/:id/quantity', protect, updateCartQuantity);

export default router;