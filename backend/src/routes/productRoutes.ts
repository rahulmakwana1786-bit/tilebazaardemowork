import { Router } from 'express';
import { createProduct, getAllProducts } from '../controllers/productController.js';
import { upload } from '../config/cloudinary.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { getProductById } from '../controllers/adminController.js';

const router = Router();

// Public: Anyone can see the tiles
router.get('/', getAllProducts);
router.get('/:id', getProductById);
// Admin Only: Only you can add new tiles
router.post('/', protect, adminOnly, upload.single('image'), createProduct);

export default router;