import mongoose from 'mongoose';

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^\S+@\S+\.\S+$/, // Kiểm tra định dạng email
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,11}$/, // Kiểm tra định dạng số điện thoại
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'replied'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'contacts',
  }
);

export default mongoose.model('Contact', contactSchema);
