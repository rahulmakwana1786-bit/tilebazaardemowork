import { Router } from 'express';
import { createPaypalPayment, capturePaypalPayment, createStripePaymentIntent, captureStripePayment, placeManualOrder } from '../controllers/paymentController.js';
import { optionalProtect } from '../middlewares/authMiddleware.js';

const router = Router();

// Secure all payment routes optionally
router.use(optionalProtect);

router.post('/create-order', createPaypalPayment);
router.post('/capture-order', capturePaypalPayment);
router.post('/create-stripe-intent', createStripePaymentIntent);
router.post('/capture-stripe', captureStripePayment);
router.post('/place-manual-order', placeManualOrder);

export default router;
