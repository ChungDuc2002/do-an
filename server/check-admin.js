import mongoose from 'mongoose';
import User from './models/users.js';

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Son');

    console.log('🔍 Checking all users:');
    const users = await User.find({}, 'fullName email isAdmin');
    console.log('Total users found:', users.length);

    users.forEach((user, index) => {
      console.log(
        `${index + 1}. User: ${user.fullName}, Email: ${user.email}, isAdmin: ${
          user.isAdmin
        }, ID: ${user._id}`
      );
    });

    // Check for admin users
    const adminUsers = users.filter((user) => user.isAdmin === true);
    console.log(`\n👨‍💼 Admin users found: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('\n⚠️ No admin users found! Creating one...');

      // Find first user and make them admin
      if (users.length > 0) {
        const firstUser = users[0];
        await User.updateOne({ _id: firstUser._id }, { isAdmin: true });
        console.log(`✅ Made "${firstUser.fullName}" an admin`);
      }
    } else {
      adminUsers.forEach((admin) => {
        console.log(`   - ${admin.fullName} (${admin.email})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
