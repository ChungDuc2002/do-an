import PayRoom from '../models/payRoom.js';

// Lấy tất cả đơn phòng đã thanh toán với pagination và search
export async function getAllBookedRooms(req, res) {
  try {
    const {
      page = 1,
      limit = 8,
      orderCode = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Tạo điều kiện tìm kiếm
    let searchConditions = {};

    // Lấy tất cả các đơn hàng (không filter theo status_payment nữa)
    // Vì đã có logic filter riêng cho từng trạng thái

    // Tìm kiếm theo orderCode
    if (orderCode) {
      searchConditions.orderCode = { $regex: orderCode, $options: 'i' };
    }

    // Lọc theo trạng thái đơn hàng
    if (status) {
      searchConditions.status_payRoom = status;
    }

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Query với populate đầy đủ thông tin
    const bookedRooms = await PayRoom.find(searchConditions)
      .populate('userId', 'fullName email phone')
      .populate(
        'rooms.roomId',
        'title images price address type acreage status'
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số documents
    const total = await PayRoom.countDocuments(searchConditions);

    return res.status(200).json({
      success: true,
      data: {
        docs: bookedRooms,
        totalDocs: total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: page < Math.ceil(total / parseInt(limit)),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get booked rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phòng đã thuê',
      error: error.message,
    });
  }
}

// Lấy chi tiết đơn phòng theo ID
export async function getBookedRoomById(req, res) {
  try {
    const { id } = req.params;

    const bookedRoom = await PayRoom.findById(id)
      .populate('userId', 'fullName email phone')
      .populate(
        'rooms.roomId',
        'title images price address type acreage status owner'
      );

    if (!bookedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn phòng',
      });
    }

    return res.status(200).json({
      success: true,
      data: bookedRoom,
    });
  } catch (error) {
    console.error('Get booked room by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin đơn phòng',
      error: error.message,
    });
  }
}

// Cập nhật trạng thái đơn phòng
export async function updateBookedRoomStatus(req, res) {
  try {
    const { id } = req.params;
    const { status_payRoom } = req.body;

    // Validate status - cập nhật theo enum mới
    const validStatuses = ['Pending', 'Confirm', 'Cancel', 'Processing'];
    if (!validStatuses.includes(status_payRoom)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const updatedRoom = await PayRoom.findByIdAndUpdate(
      id,
      { status_payRoom },
      { new: true }
    )
      .populate('userId', 'fullName email phone')
      .populate('rooms.roomId', 'title images price address type');

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn phòng',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedRoom,
    });
  } catch (error) {
    console.error('Update booked room status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái đơn phòng',
      error: error.message,
    });
  }
}
