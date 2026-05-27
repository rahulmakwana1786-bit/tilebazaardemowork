import { Router } from 'express';
import { createPaypalPayment, capturePaypalPayment } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all payment routes
router.use(protect);

router.post('/create-order', createPaypalPayment);
router.post('/capture-order', capturePaypalPayment);

export default router;
