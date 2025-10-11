import { Router } from 'express';

const apiPayments = Router();

import * as paymentController from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/middlewareControllers.js';

//! POST API------------

apiPayments.post('/create-payment', paymentController.createPaymentLink);

// apiPayments.post('/reactivate-payment', paymentController.reactivatePayment);

apiPayments.post('/payment-success', paymentController.paymentSuccess);

//! GET API------------
apiPayments.get('/order/:orderId', paymentController.getPaymentOrder);
apiPayments.get(
  '/user-booked-rooms/:userId',
  verifyToken,
  paymentController.getUserBookedRooms
);

export default apiPayments;
