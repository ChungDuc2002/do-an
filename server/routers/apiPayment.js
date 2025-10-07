import { Router } from 'express';

const apiPayments = Router();

import * as paymentController from '../controllers/paymentController.js';

//! POST API------------

apiPayments.post('/create-payment', paymentController.createPaymentLink);

apiPayments.post('/reactivate-payment', paymentController.reactivatePayment);

apiPayments.post('/payment-success', paymentController.paymentSuccess);

export default apiPayments;
