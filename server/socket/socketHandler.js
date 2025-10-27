import jwt from 'jsonwebtoken';
import Message from '../models/messages.js';
import User from '../models/users.js';

// Store active connections
const activeUsers = new Map(); // userId -> Set of socket info

export const initializeSocket = (io) => {
  // Middleware để xác thực socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      console.log('🔍 Socket auth attempt:', {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : null,
        socketId: socket.id,
      });

      if (!token) {
        console.error('❌ No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_KEY || 'defaultAccessToken'
      );

      console.log('✅ Token decoded:', {
        userId: decoded.id,
        iat: decoded.iat,
        exp: decoded.exp,
      });

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.error('❌ User not found for ID:', decoded.id);
        return next(new Error('Authentication error: User not found'));
      }

      console.log('✅ User found:', {
        name: user.fullName,
        email: user.email,
        isAdmin: user.isAdmin,
      });

      socket.userId = user._id.toString();
      socket.userRole = user.isAdmin ? 'admin' : 'user';
      socket.userInfo = user;

      next();
    } catch (error) {
      console.error(
        '❌ Socket authentication error:',
        error.name,
        error.message
      );

      if (error.name === 'JsonWebTokenError') {
        next(new Error(`Authentication error: ${error.message}`));
      } else if (error.name === 'TokenExpiredError') {
        next(new Error('Authentication error: Token expired'));
      } else {
        next(new Error('Authentication error: Invalid token'));
      }
    }
  });

  io.on('connection', (socket) => {
    console.log(
      `🔗 User connected: ${socket.userInfo.fullName} (${socket.userRole})`
    );

    // Add user to active users
    if (!activeUsers.has(socket.userId)) {
      activeUsers.set(socket.userId, new Set());
    }
    activeUsers.get(socket.userId).add({
      socketId: socket.id,
      role: socket.userRole,
      userInfo: socket.userInfo,
    });

    // Emit online users to all clients
    io.emit('online_users', Array.from(activeUsers.keys()));

    // Join user to their conversation room
    if (socket.userRole === 'user') {
      const conversationId = `user_${socket.userId}_admin`;
      socket.join(conversationId);
      console.log(`👤 User joined room: ${conversationId}`);
    } else {
      // Admin joins all conversation rooms để nhận tin nhắn từ users
      console.log('👨‍💼 Admin connected - can join any conversation room');
    }

    // Handle joining specific conversation (mainly for admin)
    socket.on('join_conversation', (data) => {
      const { conversationId } = data;
      socket.join(conversationId);
      console.log(
        `🔄 Socket ${socket.id} joined conversation: ${conversationId}`
      );
    });

    // Handle leaving conversation
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(conversationId);
      console.log(
        `🔄 Socket ${socket.id} left conversation: ${conversationId}`
      );
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { content, messageType = 'text' } = data;

        if (!content || !content.trim()) {
          socket.emit('error', {
            message: 'Nội dung tin nhắn không được để trống',
          });
          return;
        }

        // Determine conversation ID and receiver
        let conversationId,
          receiverId = null;

        if (socket.userRole === 'admin') {
          // Admin sending to specific user
          conversationId = data.conversationId;

          if (!conversationId) {
            socket.emit('error', { message: 'Cần chỉ định cuộc trò chuyện' });
            return;
          }

          // Extract user ID from conversation ID
          const userIdMatch = conversationId.match(
            /^user_([a-f0-9]{24})_admin$/
          );
          if (userIdMatch) {
            receiverId = userIdMatch[1];
          } else {
            socket.emit('error', { message: 'Invalid conversation format' });
            return;
          }

          console.log(`👨‍💼 Admin sending message to user: ${receiverId}`);
        } else {
          // User sending to admin
          conversationId = `user_${socket.userId}_admin`;
          receiverId = null; // null means sending to admin
          console.log(`👤 User sending message to admin`);
        }

        // Create new message
        const messageData = {
          senderId: socket.userId,
          receiverId,
          content: content.trim(),
          conversationId,
          messageType,
          isFromAdmin: socket.userRole === 'admin',
        };

        // Thêm thông tin phòng nếu là tin nhắn tư vấn
        if (messageType === 'room_consultation' && data.roomInfo) {
          messageData.roomInfo = data.roomInfo;
        }

        const newMessage = new Message(messageData);

        await newMessage.save();

        // Populate sender info
        await newMessage.populate('senderId', 'fullName avatar email isAdmin');

        console.log(`💾 Message saved: ${content.substring(0, 30)}...`);

        // Emit message to conversation room
        io.to(conversationId).emit('new_message', {
          message: newMessage,
          conversationId,
          sender: socket.userInfo,
        });

        // If user is sending to admin, notify all admin sockets
        if (socket.userRole === 'user') {
          // Find admin sockets and emit notification
          activeUsers.forEach((socketSet, userId) => {
            socketSet.forEach((socketInfo) => {
              if (socketInfo.role === 'admin') {
                io.to(socketInfo.socketId).emit('new_user_message', {
                  message: newMessage,
                  conversationId,
                  sender: socket.userInfo,
                });
              }
            });
          });
        }

        console.log(`📤 Message emitted to room: ${conversationId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Lỗi server khi gửi tin nhắn' });
      }
    });

    // Handle delete message (chỉ admin)
    socket.on('delete_message', async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Kiểm tra quyền admin
        if (socket.userRole !== 'admin') {
          socket.emit('error', {
            message: 'Chỉ admin mới có thể xóa tin nhắn',
          });
          return;
        }

        // Xóa tin nhắn khỏi database
        const deletedMessage = await Message.findByIdAndDelete(messageId);
        if (!deletedMessage) {
          socket.emit('error', { message: 'Không tìm thấy tin nhắn' });
          return;
        }

        console.log(`🗑️ Message deleted by admin: ${messageId}`);

        // Emit to all clients in conversation room
        io.to(conversationId).emit('message_deleted', {
          messageId,
          conversationId,
          deletedBy: socket.userInfo,
        });
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Lỗi server khi xóa tin nhắn' });
      }
    });

    // Handle delete conversation (chỉ admin)
    socket.on('delete_conversation', async (data) => {
      try {
        const { conversationId } = data;

        // Kiểm tra quyền admin
        if (socket.userRole !== 'admin') {
          socket.emit('error', {
            message: 'Chỉ admin mới có thể xóa cuộc trò chuyện',
          });
          return;
        }

        // Kiểm tra format conversationId
        const userIdMatch = conversationId.match(/^user_([a-f0-9]{24})_admin$/);
        if (!userIdMatch) {
          socket.emit('error', { message: 'ID cuộc trò chuyện không hợp lệ' });
          return;
        }

        const targetUserId = userIdMatch[1];
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          socket.emit('error', { message: 'Không tìm thấy user' });
          return;
        }

        // Đếm và xóa tất cả tin nhắn trong conversation
        const messageCount = await Message.countDocuments({ conversationId });
        await Message.deleteMany({ conversationId });

        console.log(
          `🗑️ Conversation deleted by admin: ${conversationId} (${messageCount} messages)`
        );

        // Emit to all clients
        io.emit('conversation_deleted', {
          conversationId,
          deletedMessagesCount: messageCount,
          targetUser: {
            id: targetUser._id,
            fullName: targetUser.fullName,
          },
          deletedBy: socket.userInfo,
        });

        // Emit success to admin
        socket.emit('conversation_deleted_success', {
          conversationId,
          deletedMessagesCount: messageCount,
          targetUser: targetUser.fullName,
        });
      } catch (error) {
        console.error('Error deleting conversation:', error);
        socket.emit('error', { message: 'Lỗi server khi xóa cuộc trò chuyện' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userInfo.fullName}`);

      // Remove socket from active users
      if (activeUsers.has(socket.userId)) {
        const userSockets = activeUsers.get(socket.userId);
        userSockets.forEach((socketInfo) => {
          if (socketInfo.socketId === socket.id) {
            userSockets.delete(socketInfo);
          }
        });

        // If no more sockets for this user, remove from active users
        if (userSockets.size === 0) {
          activeUsers.delete(socket.userId);
        }
      }

      // Update online users
      io.emit('online_users', Array.from(activeUsers.keys()));
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
