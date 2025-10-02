import User from '../models/users.js';
import bcrypt from 'bcrypt';

export async function sendData() {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash('123456', salt);

      await User.insertMany([
        {
          fullName: 'Nguyễn Thi Phúc',
          email: 'nguyenthiphuc@gmail.com',
          phone: '0901234567',
          password: hashPassword,
          avatar: 'default-avatar.png',
          isAdmin: false,
          rentalHistory: [
            {
              roomId: '507f1f77bcf86cd799439011',
              startDate: new Date('2023-01-01'),
              endDate: new Date('2023-12-31'),
              status: 'active',
              paymentStatus: 'paid',
            },
          ],
          currentRoom: '507f1f77bcf86cd799439011',
        },
        {
          fullName: 'Nguyễn Chung Đức',
          email: 'nguyenchungduc@gmail.com',
          phone: '0909876543',
          password: hashPassword,
          avatar: 'default-avatar.png',
          isAdmin: false,
          rentalHistory: [],
          currentRoom: null,
        },
        {
          fullName: 'Admin',
          email: 'admin@gmail.com',
          phone: '0909876533',
          password: hashPassword,
          avatar: 'default-avatar.png',
          isAdmin: true,
          rentalHistory: [],
          currentRoom: null,
        },
      ]);
      console.log('Data imported successfully');
    } else {
      console.log('Data already exists');
    }
  } catch (error) {
    console.error('Error importing data:', error);
  }
}
