import mongoose from 'mongoose';
import User from './models/users.js';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Son');

    // Reset password cho admin@gmail.com thành "admin123"
    const newPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const result = await User.updateOne(
      { email: 'admin@gmail.com' },
      { password: hashedPassword }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
