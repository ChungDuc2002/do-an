import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = tin nhắn gửi cho admin
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'room_consultation'],
      default: 'text',
    },
    conversationId: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFromAdmin: {
      type: Boolean,
      default: false,
    },
    // Metadata cho room consultation
    roomInfo: {
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null,
      },
      roomTitle: String,
      roomPrice: Number,
      roomType: String,
      roomImage: String,
      roomAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.plugin(mongoosePaginate);

// Index để tối ưu query
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

export default mongoose.model('Message', messageSchema);
