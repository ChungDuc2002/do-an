import Message from '../models/messages.js';
import User from '../models/users.js';

// Lấy tin nhắn conversation của user hiện tại với admin
export const getUserConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = `user_${userId}_admin`;

    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'senderId',
          select: 'fullName avatar email isAdmin',
        },
      ],
    };

    const messages = await Message.paginate({ conversationId }, options);

    // Đảo ngược thứ tự để tin nhắn mới nhất ở cuối
    messages.docs = messages.docs.reverse();

    return res.status(200).json({
      success: true,
      data: messages,
      conversationId,
      message: 'Lấy cuộc trò chuyện thành công',
    });
  } catch (error) {
    console.error('Error getting user conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy cuộc trò chuyện',
      error: error.message,
    });
  }
};

// Lấy danh sách tất cả conversations (cho admin)
export const getAllConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Lấy các cuộc trò chuyện với tin nhắn cuối cùng
    const conversations = await Message.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    // Populate thông tin user cho mỗi conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Extract user ID từ conversationId (format: user_{userId}_admin)
        const userIdMatch = conv._id.match(/^user_([a-f0-9]{24})_admin$/);
        if (userIdMatch) {
          const userId = userIdMatch[1];
          const user = await User.findById(userId).select(
            'fullName avatar email'
          );

          return {
            _id: conv._id,
            sender: user,
            lastMessage: conv.lastMessage,
            messageCount: conv.messageCount,
            unreadCount: conv.unreadCount,
          };
        }
        return null;
      })
    );

    // Lọc bỏ conversations không hợp lệ
    const validConversations = populatedConversations.filter(
      (conv) => conv !== null
    );

    return res.status(200).json({
      success: true,
      data: validConversations,
      total: validConversations.length,
      message: 'Lấy danh sách cuộc trò chuyện thành công',
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách cuộc trò chuyện',
      error: error.message,
    });
  }
};

// Lấy tin nhắn của một cuộc trò chuyện cụ thể (cho admin)
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: 'senderId',
          select: 'fullName avatar email isAdmin',
        },
      ],
    };

    const messages = await Message.paginate({ conversationId }, options);

    // Đảo ngược thứ tự để tin nhắn mới nhất ở cuối
    messages.docs = messages.docs.reverse();

    return res.status(200).json({
      success: true,
      data: messages,
      message: 'Lấy tin nhắn thành công',
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy tin nhắn',
      error: error.message,
    });
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Chỉ đánh dấu tin nhắn mà user này là receiver
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Đánh dấu tin nhắn đã đọc thành công',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu tin nhắn',
      error: error.message,
    });
  }
};

// Xóa tin nhắn (chỉ admin)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Kiểm tra user có phải admin không
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể xóa tin nhắn',
      });
    }

    // Tìm và xóa tin nhắn
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn',
      });
    }

    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({
      success: true,
      message: 'Xóa tin nhắn thành công',
      deletedMessageId: messageId,
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tin nhắn',
      error: error.message,
    });
  }
};

// Xóa toàn bộ cuộc trò chuyện (chỉ admin)
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Kiểm tra user có phải admin không
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể xóa cuộc trò chuyện',
      });
    }

    // Kiểm tra format conversationId (user_{userId}_admin)
    const userIdMatch = conversationId.match(/^user_([a-f0-9]{24})_admin$/);
    if (!userIdMatch) {
      return res.status(400).json({
        success: false,
        message: 'ID cuộc trò chuyện không hợp lệ',
      });
    }

    const targetUserId = userIdMatch[1];
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    // Đếm số tin nhắn sẽ bị xóa
    const messageCount = await Message.countDocuments({ conversationId });

    // Xóa tất cả tin nhắn trong conversation
    const deleteResult = await Message.deleteMany({ conversationId });

    return res.status(200).json({
      success: true,
      message: `Đã xóa cuộc trò chuyện với ${targetUser.fullName}`,
      deletedConversationId: conversationId,
      deletedMessagesCount: deleteResult.deletedCount,
      targetUser: {
        id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa cuộc trò chuyện',
      error: error.message,
    });
  }
};
