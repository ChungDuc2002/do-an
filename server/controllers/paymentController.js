import { PayOS } from '@payos/node';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import payRoom from '../models/payRoom.js';
import Rooms from '../models/rooms.js';

dotenv.config();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// const generateOrderCode = () => {
//   return Math.floor(Math.random() * 9007199254740991) + 1; // Tạo số ngẫu nhiên từ 1 đến 9007199254740991
// };

export async function createPaymentLink(req, res) {
  try {
    const { amount, description, userId, userInfo, rooms } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ',
      });
    }

    if (!userId || !rooms) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết',
      });
    }

    const roomsArray = Array.isArray(rooms) ? rooms : [rooms];

    // Generate orderCode nhỏ hơn để tránh vượt quá giới hạn
    const orderCode = Math.floor(Math.random() * 1000000) + 1;

    // Rút ngắn description xuống 25 ký tự
    const shortDescription = description?.substring(0, 25) || 'Đặt cọc phòng';

    const paymentLinkData = {
      orderCode: orderCode,
      amount: parseInt(amount),
      description: shortDescription,
      cancelUrl: 'http://localhost:3000/payment/cancel',
      returnUrl: 'http://localhost:3000/payment/success',
      // Chuyển đổi timestamp sang số nguyên 32-bit
      expiredAt: Math.min(
        Math.floor(Date.now() / 1000) + 1800, // 30 phút
        2147483647
      ),
    };

    console.log('Creating payment with:', paymentLinkData);

    const paymentResponse = await payos.paymentRequests.create(paymentLinkData);

    if (!paymentResponse || !paymentResponse.checkoutUrl) {
      throw new Error('Không thể tạo link thanh toán');
    }

    const newPayRoom = new payRoom({
      _id: new mongoose.Types.ObjectId(),
      userId,
      rooms: roomsArray,
      userInfo,
      totalAmount: amount,
      status_payment: 'Pending',
      status_order: 'Pending',
      orderCode,
    });
    await newPayRoom.save();

    return res.json({
      success: true,
      checkoutUrl: paymentResponse.checkoutUrl,
      orderId: newPayRoom._id.toString(),
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thanh toán: ' + error.message,
    });
  }
}

export async function getPaymentOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await payRoom.findById(orderId).populate('rooms.roomId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get payment order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng: ' + error.message,
    });
  }
}

export async function paymentSuccess(req, res) {
  try {
    const { orderId, rooms, userId, orderCode } = req.body;

    // Log giá trị để kiểm tra
    console.log('Payment success data:', { orderId, rooms, userId, orderCode });

    let paymentOrder;

    // Tìm đơn hàng theo orderCode trước (ưu tiên orderCode vì đây là thông tin từ PayOS)
    if (orderCode) {
      paymentOrder = await payRoom.findOne({ orderCode: parseInt(orderCode) });
      console.log(
        `Tìm kiếm theo orderCode: ${orderCode}, Kết quả: ${
          paymentOrder ? 'Có' : 'Không có'
        }`
      );
    }

    // Nếu không tìm thấy theo orderCode, thử tìm theo orderId
    if (!paymentOrder && orderId) {
      paymentOrder = await payRoom.findById(orderId);
      console.log(
        `Tìm kiếm theo orderId: ${orderId}, Kết quả: ${
          paymentOrder ? 'Có' : 'Không có'
        }`
      );
    }

    if (!paymentOrder) {
      // Thử tìm theo orderCode dạng string
      if (orderCode) {
        paymentOrder = await payRoom.findOne({
          orderCode: orderCode.toString(),
        });
        console.log(
          `Tìm kiếm theo orderCode (string): ${orderCode}, Kết quả: ${
            paymentOrder ? 'Có' : 'Không có'
          }`
        );
      }
    }

    if (!paymentOrder) {
      console.log('Không tìm thấy đơn hàng với các thông tin:', {
        orderId,
        orderCode,
      });
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng thanh toán',
      });
    }

    // Cập nhật trạng thái đơn hàng thanh toán thành Completed
    await payRoom.updateOne(
      { _id: paymentOrder._id },
      { $set: { status_payment: 'Completed' } }
    );

    // Cập nhật trạng thái phòng và người thuê hiện tại
    const roomsToUpdate = paymentOrder.rooms;

    for (const roomItem of roomsToUpdate) {
      const roomId = roomItem.roomId;

      // Cập nhật status phòng thành 'rented' và currentTenant
      await Rooms.updateOne(
        { _id: roomId },
        {
          $set: {
            status: 'rented',
            currentTenant: paymentOrder.userId,
          },
        }
      );

      console.log(
        `Updated room ${roomId} - Status: rented, Tenant: ${paymentOrder.userId}`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Thanh toán thành công và đã cập nhật trạng thái phòng',
      data: {
        orderId: paymentOrder._id,
        updatedRooms: roomsToUpdate.length,
      },
    });
  } catch (error) {
    console.error('Error processing payment success:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý thanh toán thành công: ' + error.message,
    });
  }
}

// Webhook handler cho PayOS callback
export async function payosWebhook(req, res) {
  try {
    console.log('PayOS Webhook received:', req.body);

    const webhookData = req.body;
    const { orderCode, code, desc, data } = webhookData;

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu orderCode trong webhook',
      });
    }

    // Tìm đơn hàng theo orderCode
    const paymentOrder = await payRoom.findOne({ orderCode: orderCode });

    if (!paymentOrder) {
      console.log(`Không tìm thấy đơn hàng với orderCode: ${orderCode}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    // Kiểm tra nếu thanh toán thành công (code === '00')
    if (code === '00' || (data && data.resultCode === 0)) {
      console.log(`Thanh toán thành công cho orderCode: ${orderCode}`);

      // Cập nhật trạng thái thanh toán
      await payRoom.updateOne(
        { orderCode: orderCode },
        { $set: { status_payment: 'Completed' } }
      );

      // Cập nhật trạng thái phòng
      const roomsToUpdate = paymentOrder.rooms;
      for (const roomItem of roomsToUpdate) {
        const roomId = roomItem.roomId;
        await Rooms.updateOne(
          { _id: roomId },
          {
            $set: {
              status: 'rented',
              currentTenant: paymentOrder.userId,
            },
          }
        );
        console.log(
          `Updated room ${roomId} - Status: rented, Tenant: ${paymentOrder.userId}`
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook xử lý thành công',
      });
    } else {
      console.log(
        `Thanh toán thất bại cho orderCode: ${orderCode}, code: ${code}, desc: ${desc}`
      );
      return res.status(200).json({
        success: true,
        message: 'Thanh toán thất bại, không cập nhật',
      });
    }
  } catch (error) {
    console.error('Error processing PayOS webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý webhook: ' + error.message,
    });
  }
}

// API lấy danh sách phòng thanh toán thất bại (Pending) của user
export async function getUserFailedPayments(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin userId',
      });
    }

    // Lấy danh sách đơn hàng có trạng thái Pending
    const failedOrders = await payRoom
      .find({
        userId: userId,
        status_payment: 'Pending',
      })
      .populate({
        path: 'rooms.roomId',
        model: 'Rooms',
        populate: {
          path: 'owner',
          model: 'User',
          select: 'fullName email phone',
        },
      })
      .sort({ createdAt: -1 });

    if (!failedOrders || failedOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không có đơn hàng thanh toán thất bại',
        data: [],
      });
    }

    // Tạo danh sách phòng thanh toán thất bại với thông tin chi tiết
    const failedPayments = [];

    failedOrders.forEach((order) => {
      order.rooms.forEach((room) => {
        if (room.roomId) {
          failedPayments.push({
            orderId: order._id,
            orderCode: order.orderCode,
            bookingDate: order.createdAt,
            depositAmount: room.price,
            totalAmount: order.totalAmount,
            status_payment: order.status_payment,
            status_payRoom: order.status_payRoom,
            roomInfo: {
              _id: room.roomId._id,
              title: room.roomId.title,
              description: room.roomId.description,
              price: room.roomId.price,
              images: room.roomId.images,
              address: room.roomId.address,
              type: room.roomId.type,
              status: room.roomId.status,
              amenities: room.roomId.amenities,
              acreage: room.roomId.acreage,
              electricity: room.roomId.electricity,
              water: room.roomId.water,
              owner: room.roomId.owner,
            },
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng thanh toán thất bại thành công',
      data: failedPayments,
      total: failedPayments.length,
    });
  } catch (error) {
    console.error('Error getting user failed payments:', error);
    return res.status(500).json({
      success: false,
      message:
        'Lỗi khi lấy danh sách phòng thanh toán thất bại: ' + error.message,
    });
  }
}

// API thanh toán lại cho đơn hàng Pending
export async function retryPayment(req, res) {
  try {
    const { orderId } = req.params;
    console.log('retryPayment called with orderId:', orderId);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin orderId',
      });
    }

    // Tìm đơn hàng
    const existingOrder = await payRoom
      .findById(orderId)
      .populate('rooms.roomId');

    console.log('Found existing order:', existingOrder ? 'Yes' : 'No');

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    if (existingOrder.status_payment !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng này đã được xử lý hoặc không thể thanh toán lại',
      });
    }

    // Tạo orderCode mới (số nguyên nhỏ hơn để tránh vượt quá giới hạn PayOS)
    const newOrderCode = Math.floor(Math.random() * 1000000) + 1;

    // Tạo link thanh toán mới với orderCode mới
    const paymentLinkData = {
      orderCode: newOrderCode,
      amount: parseInt(existingOrder.totalAmount),
      description: `Thanh toán lại - ${
        existingOrder.rooms[0]?.roomId?.title || 'Đặt cọc phòng'
      }`.substring(0, 25),
      cancelUrl: 'http://localhost:3000/payment/cancel',
      returnUrl: 'http://localhost:3000/payment/success',
      expiredAt: Math.min(
        Math.floor(Date.now() / 1000) + 1800, // 30 phút
        2147483647
      ),
    };

    console.log('Retry payment with new orderCode:', paymentLinkData);

    const paymentResponse = await payos.paymentRequests.create(paymentLinkData);

    if (!paymentResponse || !paymentResponse.checkoutUrl) {
      throw new Error('Không thể tạo link thanh toán');
    }

    // Cập nhật orderCode mới và thời gian tạo mới cho đơn hàng
    await payRoom.updateOne(
      { _id: orderId },
      {
        $set: {
          orderCode: newOrderCode,
          updatedAt: new Date(),
        },
      }
    );

    return res.json({
      success: true,
      checkoutUrl: paymentResponse.checkoutUrl,
      orderId: existingOrder._id.toString(),
      message: 'Tạo link thanh toán lại thành công',
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi thanh toán lại: ' + error.message,
    });
  }
}

// API lấy danh sách phòng đã đặt cọc của user
export async function getUserBookedRooms(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin userId',
      });
    }

    // Lấy danh sách đơn hàng đã thanh toán thành công
    const bookedOrders = await payRoom
      .find({
        userId: userId,
        status_payment: 'Completed',
      })
      .populate({
        path: 'rooms.roomId',
        model: 'Rooms',
        populate: {
          path: 'owner',
          model: 'User',
          select: 'fullName email phone',
        },
      })
      .sort({ createdAt: -1 });

    if (!bookedOrders || bookedOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Bạn chưa đặt cọc phòng nào',
        data: [],
      });
    }

    // Tạo danh sách phòng đã đặt cọc với thông tin chi tiết
    const bookedRooms = [];

    bookedOrders.forEach((order) => {
      order.rooms.forEach((room) => {
        if (room.roomId) {
          bookedRooms.push({
            orderId: order._id,
            orderCode: order.orderCode,
            bookingDate: order.createdAt,
            depositAmount: room.price,
            totalAmount: order.totalAmount,
            status_payment: order.status_payment,
            status_payRoom: order.status_payRoom,
            roomInfo: {
              _id: room.roomId._id,
              title: room.roomId.title,
              description: room.roomId.description,
              price: room.roomId.price,
              images: room.roomId.images,
              address: room.roomId.address,
              type: room.roomId.type,
              status: room.roomId.status,
              amenities: room.roomId.amenities,
              acreage: room.roomId.acreage,
              electricity: room.roomId.electricity,
              water: room.roomId.water,
              owner: room.roomId.owner,
            },
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng đã đặt cọc thành công',
      data: bookedRooms,
      total: bookedRooms.length,
    });
  } catch (error) {
    console.error('Error getting user booked rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phòng đã đặt cọc: ' + error.message,
    });
  }
}
