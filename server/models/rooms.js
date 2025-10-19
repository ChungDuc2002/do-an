import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const roomSchema = mongoose.Schema(
  {
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
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    // tien dien
    electricity: {
      type: Number,
    },
    // tien nuoc
    water: {
      type: Number,
    },
    // dien tich
    acreage: {
      type: Number,
      required: true,
    },
    // tiện nghi
    amenities: [
      {
        type: String,
        enum: [
          'wifi',
          'air_conditioner',
          'water_heater',
          'refrigerator',
          'washing_machine',
          'parking',
          'elevator', // thang máy
          'drying_area', // chỗ phơi đồ
          'yard', // sân bãi
        ],
        required: true,
      },
    ],
    // chủ phòng
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    // người đang thuê phòng hiện tại
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      street: String,
      ward: String,
      district: String,
      city: {
        type: String,
        default: 'Đà Nẵng',
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    type: {
      type: String,
      enum: ['phong-tro', 'nha-nguyen-can', 'can-ho'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
    },
    // lượt xem
    views: {
      type: Number,
      default: 0,
    },
    rules: [{ type: String }], // quy tắc
  },
  { timestamps: true }
);
roomSchema.plugin(mongoosePaginate);

export default mongoose.model('Rooms', roomSchema);
