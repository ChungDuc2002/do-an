import User from '../models/users.js';
import Room from '../models/rooms.js';
import PayRoom from '../models/payRoom.js';

// Thống kê tổng quan
export async function getOverallStatistics(req, res) {
  try {
    // Đếm tổng số người dùng đã đăng ký
    const totalUsers = await User.countDocuments();

    // Đếm tổng số phòng
    const totalRooms = await Room.countDocuments();

    // Đếm số phòng theo từng loại
    const roomsByType = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Đếm số phòng đã được thuê (status_payRoom = 'Confirm' hoặc 'Processing')
    const bookedRooms = await PayRoom.countDocuments({
      status_payRoom: { $in: ['Confirm', 'Processing'] },
    });

    // Thống kê phòng theo trạng thái
    const roomsByStatus = await PayRoom.aggregate([
      {
        $group: {
          _id: '$status_payRoom',
          count: { $sum: 1 },
        },
      },
    ]);

    // Thống kê doanh thu theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await PayRoom.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status_payRoom: { $in: ['Confirm', 'Processing'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalRooms,
          bookedRooms,
          availableRooms: totalRooms - bookedRooms,
        },
        roomsByType,
        roomsByStatus,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Get overall statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê tổng quan',
      error: error.message,
    });
  }
}

// Thống kê chi tiết người dùng
export async function getUserStatistics(req, res) {
  try {
    // Thống kê người dùng đăng ký theo tháng (12 tháng gần nhất)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userRegistrationByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Thống kê người dùng theo vai trò
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        userRegistrationByMonth,
        usersByRole,
      },
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê người dùng',
      error: error.message,
    });
  }
}

// Thống kê chi tiết phòng
export async function getRoomStatistics(req, res) {
  try {
    // Thống kê phòng theo loại với thông tin chi tiết
    const detailedRoomsByType = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgAcreage: { $avg: '$acreage' },
        },
      },
    ]);

    // Thống kê phòng theo khu vực (city)
    const roomsByCity = await Room.aggregate([
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Phòng được yêu thích nhất
    const popularRooms = await Room.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title price type address views');

    return res.status(200).json({
      success: true,
      data: {
        detailedRoomsByType,
        roomsByCity,
        popularRooms,
      },
    });
  } catch (error) {
    console.error('Get room statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê phòng',
      error: error.message,
    });
  }
}

// Thống kê doanh thu
export async function getRevenueStatistics(req, res) {
  try {
    // Doanh thu theo tháng (12 tháng gần nhất)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await PayRoom.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status_payRoom: { $in: ['Confirm', 'Processing'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Tổng doanh thu
    const totalRevenue = await PayRoom.aggregate([
      {
        $match: {
          status_payRoom: { $in: ['Confirm', 'Processing'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        totalRevenue: totalRevenue[0] || { total: 0, count: 0 },
      },
    });
  } catch (error) {
    console.error('Get revenue statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê doanh thu',
      error: error.message,
    });
  }
}
