import { Router } from 'express';
const apiPayRoom = Router();

import * as payRoomController from '../controllers/payRoomController.js';
import PayRoom from '../models/payRoom.js';

//! Get API------------
apiPayRoom.get('/getAllBookedRooms', payRoomController.getAllBookedRooms);
apiPayRoom.get('/getBookedRoomById/:id', payRoomController.getBookedRoomById);

//! Put API------------
apiPayRoom.put('/updateStatus/:id', payRoomController.updateBookedRoomStatus);

//! Post API------------
// Temporary API for testing - tạo data mẫu
apiPayRoom.post('/createTestData', async (req, res) => {
  try {
    const testBookings = [
      {
        userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
        rooms: [
          {
            roomId: '507f1f77bcf86cd799439012', // Replace with actual room ID
            price: 3000000,
          },
        ],
        userInfo: { name: 'Nguyễn Văn A', phone: '0901234567' },
        orderCode: 'ORD001',
        totalAmount: 3000000,
        status_payment: 'PAID',
        status_payRoom: 'Pending',
      },
      {
        userId: '507f1f77bcf86cd799439013',
        rooms: [
          {
            roomId: '507f1f77bcf86cd799439014',
            price: 4500000,
          },
        ],
        userInfo: { name: 'Trần Thị B', phone: '0912345678' },
        orderCode: 'ORD002',
        totalAmount: 4500000,
        status_payment: 'PAID',
        status_payRoom: 'Processing',
      },
    ];

    await PayRoom.insertMany(testBookings);
    res.status(200).json({ message: 'Test data created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! Delete API------------

export default apiPayRoom;
