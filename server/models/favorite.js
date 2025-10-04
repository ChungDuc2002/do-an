import mongoose from 'mongoose';

const favoriteSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rooms',
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Favorite', favoriteSchema);
