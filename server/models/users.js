import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Lich su thue phong
    rentalHistory: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
        },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ['active', 'completed', 'cancelled'],
          default: 'active',
        },
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending',
        },
      },
    ],
    // Phong dang o hien tai
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    refreshToken: {
      type: String,
    },
    //CCCD
    // identityCard: {
    //   number: String,
    //   frontImage: String,
    //   backImage: String,
    //   isVerified: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
