import { Router } from 'express';

const apiPayments = Router();

import * as paymentController from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/middlewareControllers.js';

//! POST API------------

apiPayments.post('/create-payment', paymentController.createPaymentLink);

// apiPayments.post('/reactivate-payment', paymentController.reactivatePayment);

apiPayments.post('/payment-success', paymentController.paymentSuccess);

// Webhook cho PayOS callback
apiPayments.post('/payos-webhook', paymentController.payosWebhook);

//! GET API------------
apiPayments.get('/order/:orderId', paymentController.getPaymentOrder);
apiPayments.get(
  '/user-booked-rooms/:userId',
  verifyToken,
  paymentController.getUserBookedRooms
);
apiPayments.get(
  '/user-failed-payments/:userId',
  verifyToken,
  paymentController.getUserFailedPayments
);

//! POST API------------
apiPayments.post(
  '/retry-payment/:orderId',
  verifyToken,
  paymentController.retryPayment
);

export default apiPayments;
