import { PayOS } from '@payos/node';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import payRoom from '../models/payRoom.js';

dotenv.config();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const generateOrderCode = () => {
  return Math.floor(Math.random() * 9007199254740991) + 1; // Tạo số ngẫu nhiên từ 1 đến 9007199254740991
};

export async function createPaymentLink(req, res) {
  try {
    const { amount, description, userId, userInfo, rooms } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ',
      });
    }

    if (!userId || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết',
      });
    }

    const roomsArray = Array.isArray(rooms) ? rooms : [rooms];

    // Generate orderCode nhỏ hơn để tránh vượt quá giới hạn
    const orderCode = Math.floor(Math.random() * 1000000) + 1;

    // Rút ngắn description xuống 25 ký tự
    const shortDescription = description?.substring(0, 25) || 'Đặt cọc phòng';

    const paymentLinkData = {
      orderCode: orderCode,
      amount: parseInt(amount),
      description: shortDescription,
      cancelUrl: 'http://localhost:3000/payment/cancel',
      returnUrl: 'http://localhost:3000/payment/success',
      // Chuyển đổi timestamp sang số nguyên 32-bit
      expiredAt: Math.min(
        Math.floor(Date.now() / 1000) + 1800, // 30 phút
        2147483647
      ),
    };

    console.log('Creating payment with:', paymentLinkData);

    const paymentResponse = await payos.paymentRequests.create(paymentLinkData);

    if (!paymentResponse || !paymentResponse.checkoutUrl) {
      throw new Error('Không thể tạo link thanh toán');
    }

    const newPayRoom = new payRoom({
      _id: new mongoose.Types.ObjectId(),
      userId,
      rooms: roomsArray,
      userInfo,
      totalAmount: amount,
      status_payment: 'Pending',
      status_order: 'Pending',
      orderCode,
    });
    await newPayRoom.save();

    return res.json({
      success: true,
      checkoutUrl: paymentResponse.checkoutUrl,
      orderId: newPayRoom._id.toString(),
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thanh toán: ' + error.message,
    });
  }
}
