import mongoose from 'mongoose';

const slideSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },

  {
    timestamps: true,
    collection: 'slides',
  }
);

export default mongoose.model('Slide', slideSchema);
