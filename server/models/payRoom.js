import mongoose from 'mongoose';

const payRoomSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rooms: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Rooms',
        },
        price: { type: Number },
      },
    ],
    userInfo: { type: Object },
    orderCode: { type: String },
    totalAmount: { type: Number },
    status_payment: { type: String, default: 'Pending' },
    status_payRoom: {
      type: String,
      enum: ['Pending', 'Confirm', 'Cancel', 'Processing'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('payRooms', payRoomSchema);
