import rooms from '../models/rooms.js';

import multer from 'multer';
import path from 'path';

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Tạo thư mục uploads trong server
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export async function searchRooms(req, res) {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      minAcreage,
      maxAcreage,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    let searchConditions = {};

    if (type) {
      searchConditions.type = type;
    }

    if (status) {
      searchConditions.status = status;
    }

    if (minPrice || maxPrice) {
      searchConditions.price = {};
      if (minPrice) searchConditions.price.$gte = parseInt(minPrice);
      if (maxPrice) searchConditions.price.$lte = parseInt(maxPrice);
    }

    if (minAcreage || maxAcreage) {
      searchConditions.acreage = {};
      if (minAcreage) searchConditions.acreage.$gte = parseInt(minAcreage);
      if (maxAcreage) searchConditions.acreage.$lte = parseInt(maxAcreage);
    }

    const roomsList = await rooms
      .find(searchConditions)
      .populate('owner', 'fullName email phone')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await rooms.countDocuments(searchConditions);

    return res.status(200).json({
      success: true,
      data: {
        docs: roomsList,
        totalDocs: total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Search rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm phòng',
      error: error.message,
    });
  }
}

export async function createRoom(req, res) {
  try {
    upload.fields([
      { name: 'images', maxCount: 6 },
      { name: 'rules', maxCount: 3 },
    ])(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: 'Lỗi upload file' });
      }

      const roomData = req.body;

      // Parse JSON strings
      if (roomData.address) {
        roomData.address = JSON.parse(roomData.address);
      }
      if (roomData.amenities) {
        roomData.amenities = JSON.parse(roomData.amenities);
      }

      // Thêm đường dẫn hình ảnh
      if (req.files) {
        // Xử lý images
        if (req.files['images']) {
          roomData.images = req.files['images'].map(
            (file) => `/uploads/${file.filename}`
          );
        }
        // Xử lý rules
        if (req.files['rules']) {
          roomData.rules = req.files['rules'].map(
            (file) => `/uploads/${file.filename}`
          );
        }
      }

      const newRoom = await rooms.create(roomData);
      return res.status(201).json({
        message: 'Tạo phòng thành công',
        room: newRoom,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateRoom(req, res) {
  try {
    upload.fields([
      { name: 'images', maxCount: 6 },
      { name: 'rules', maxCount: 3 },
    ])(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: 'Lỗi upload file' });
      }

      const { id } = req.params;
      const roomData = { ...req.body };

      // Parse JSON strings nếu có
      if (roomData.address && typeof roomData.address === 'string') {
        roomData.address = JSON.parse(roomData.address);
      }
      if (roomData.amenities && typeof roomData.amenities === 'string') {
        roomData.amenities = JSON.parse(roomData.amenities);
      }

      // Lấy thông tin phòng hiện tại để giữ lại ảnh cũ nếu không upload ảnh mới
      const existingRoom = await rooms.findById(id);
      if (!existingRoom) {
        return res.status(404).json({ message: 'Không tìm thấy phòng' });
      }

      // Xử lý upload file mới
      if (req.files) {
        if (req.files['images']) {
          roomData.images = req.files['images'].map(
            (file) => `/uploads/${file.filename}`
          );
        }
        if (req.files['rules']) {
          roomData.rules = req.files['rules'].map(
            (file) => `/uploads/${file.filename}`
          );
        }
      }

      // Xử lý logic khi thay đổi status từ rented về available
      if (roomData.status === 'available' && existingRoom.status === 'rented') {
        // Xóa currentTenant khi phòng chuyển từ đã thuê về còn trống
        roomData.currentTenant = null;
        console.log(
          `Phòng ${id} chuyển từ rented về available - đã xóa currentTenant`
        );
      }

      const updatedRoom = await rooms
        .findByIdAndUpdate(id, roomData, { new: true })
        .populate('owner', 'fullName email phone')
        .populate('currentTenant', 'fullName');

      return res.status(200).json({
        message: 'Cập nhật phòng thành công',
        room: updatedRoom,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getRoomsByType(req, res) {
  try {
    const products = await rooms.find({ type: req.query.type });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getTypeRoom(req, res) {
  const { type } = req.params;

  try {
    const room = await rooms.find({ type: { $in: [type] } });
    if (room.length === 0) {
      return res.status(404).json({ message: 'No room found in this type' });
    }
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const deletedRoom = await rooms.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    return res.status(200).json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllRooms(req, res) {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'owner', select: 'fullName email phone' },
        { path: 'currentTenant', select: 'fullName' },
      ],
    };

    const roomsList = await rooms.paginate({}, options);
    return res.status(200).json(roomsList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getRoomById(req, res) {
  try {
    const { id } = req.params;
    const room = await rooms.findById(id);
    // .populate('owner', 'fullName email phone')
    // .populate('currentTenant', 'fullName');

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    // Tăng lượt xem
    room.views += 1;
    await room.save();

    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Lấy danh sách phòng HOT (views > 50)
export async function getHotRooms(req, res) {
  try {
    const { limit = 50 } = req.query;

    const hotRooms = await rooms
      .find({
        views: { $gt: 50 },
        status: 'available', // Chỉ lấy phòng còn trống
      })
      .populate('owner', 'fullName email phone')
      .sort({ views: -1 }) // Sắp xếp theo lượt xem giảm dần
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: hotRooms || [], // Đảm bảo luôn trả về array
      total: hotRooms ? hotRooms.length : 0,
    });
  } catch (error) {
    console.error('Get hot rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phòng HOT',
      error: error.message,
      data: [], // Trả về array rỗng khi lỗi
      total: 0,
    });
  }
}
