import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Badge,
  Empty,
  Spin,
  message as antMessage,
  Row,
  Col,
  Tooltip,
  Modal,
  Popconfirm,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import './style.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

const AdminChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentConversationRef = useRef(null);

  useEffect(() => {
    document.title = 'Quản lý Chat - Admin';
    initializeSocket();
    loadConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSocket = () => {
    let token = localStorage.getItem('authAdminSon');

    console.log('🔍 Admin initializing socket:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      allAuthKeys: Object.keys(localStorage).filter((key) =>
        key.includes('auth')
      ),
      authAdminSon: !!localStorage.getItem('authAdminSon'),
      authSon: !!localStorage.getItem('authSon'),
    });

    // Fallback: nếu không có authAdminSon, thử dùng authSon (nếu user là admin)
    if (!token) {
      token = localStorage.getItem('authSon');
      console.log('🔄 Fallback to authSon token:', !!token);
    }

    if (token) {
      const parsedToken = JSON.parse(token);
      console.log(
        '🚀 Connecting with token preview:',
        parsedToken.substring(0, 30) + '...'
      );

      socketRef.current = io('http://localhost:5000', {
        auth: { token: parsedToken },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Admin connected to chat server');
        setConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Admin disconnected from chat server');
        setConnected(false);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 Admin reconnected after', attemptNumber, 'attempts');
        setConnected(true);
      });

      socketRef.current.on('new_user_message', (data) => {
        console.log('New user message:', data);
        // Refresh conversations to show new message
        loadConversations();

        // If we're viewing this conversation, add the message
        const currentConv = currentConversationRef.current;
        if (currentConv && currentConv._id === data.conversationId) {
          setMessages((prev) => [...prev, data.message]);
        }

        antMessage.info(`Tin nhắn mới từ ${data.sender.fullName}`);
      });

      socketRef.current.on('new_message', (data) => {
        console.log('Admin received new_message:', data);
        // Add message to current conversation if it matches
        const currentConv = currentConversationRef.current;
        if (currentConv && currentConv._id === data.conversationId) {
          setMessages((prev) => [...prev, data.message]);
        }
      });

      socketRef.current.on('message_deleted', (data) => {
        console.log('Message deleted:', data);
        // Remove message from current conversation if it matches
        const currentConv = currentConversationRef.current;
        if (currentConv && currentConv._id === data.conversationId) {
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== data.messageId)
          );
        }
        // Refresh conversations to update last message
        loadConversations();
      });

      socketRef.current.on('conversation_deleted', (data) => {
        console.log('Conversation deleted:', data);
        // Remove conversation from list
        setConversations((prev) =>
          prev.filter((conv) => conv._id !== data.conversationId)
        );
        // Clear selected conversation if it was deleted
        const currentConv = currentConversationRef.current;
        if (currentConv && currentConv._id === data.conversationId) {
          setSelectedConversation(null);
          setMessages([]);
          currentConversationRef.current = null;
        }
        antMessage.success(
          `Đã xóa cuộc trò chuyện với ${data.targetUser.fullName}`
        );
      });

      socketRef.current.on('conversation_deleted_success', (data) => {
        console.log('Conversation deleted successfully:', data);
        antMessage.success(
          `Đã xóa cuộc trò chuyện với ${data.targetUser} (${data.deletedMessagesCount} tin nhắn)`
        );
      });

      socketRef.current.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('Error type:', error.type);
        console.error('Error message:', error.message);
        console.error('Error description:', error.description);
        antMessage.error('Không thể kết nối chat: ' + error.message);
        setConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('❌ Socket error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        antMessage.error(error.message || 'Lỗi kết nối chat');
      });
    } else {
      console.error('❌ No authAdminSon token found');
      antMessage.error('Không tìm thấy token admin. Vui lòng đăng nhập lại.');
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('authAdminSon');
      if (!token) {
        token = localStorage.getItem('authSon');
      }
      const parsedToken = JSON.parse(token);
      const response = await axios.get(
        'http://localhost:5000/chat/conversations',
        {
          headers: { token: `Bearer ${parsedToken}` },
          params: { limit: 50 },
        }
      );

      if (response.data.success) {
        setConversations(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      antMessage.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      let token = localStorage.getItem('authAdminSon');
      if (!token) {
        token = localStorage.getItem('authSon');
      }
      const parsedToken = JSON.parse(token);

      const response = await axios.get(
        `http://localhost:5000/chat/messages/${conversationId}`,
        {
          headers: { token: `Bearer ${parsedToken}` },
          params: { limit: 100 },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.docs || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      antMessage.error('Không thể tải tin nhắn');
    } finally {
      setMessagesLoading(false);
    }
  };

  const selectConversation = (conversation) => {
    // Leave previous conversation room
    if (selectedConversation && socketRef.current && connected) {
      socketRef.current.emit('leave_conversation', {
        conversationId: selectedConversation._id,
      });
    }

    setSelectedConversation(conversation);
    currentConversationRef.current = conversation;
    setMessages([]);
    loadMessages(conversation._id);

    // Join new conversation room
    if (socketRef.current && connected) {
      setTimeout(() => {
        socketRef.current.emit('join_conversation', {
          conversationId: conversation._id,
        });
      }, 100);
    }
  };

  const sendMessage = () => {
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !socketRef.current ||
      !connected
    )
      return;

    try {
      socketRef.current.emit('send_message', {
        content: newMessage.trim(),
        conversationId: selectedConversation._id,
        messageType: 'text',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Lỗi khi gửi tin nhắn');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      // Emit socket event for realtime deletion
      if (socketRef.current && connected && selectedConversation) {
        socketRef.current.emit('delete_message', {
          messageId,
          conversationId: selectedConversation._id,
        });
      }

      antMessage.success('Đã xóa tin nhắn');
    } catch (error) {
      console.error('Error deleting message:', error);
      antMessage.error('Lỗi khi xóa tin nhắn');
    }
  };

  const deleteConversation = async (conversation) => {
    try {
      if (socketRef.current && connected) {
        socketRef.current.emit('delete_conversation', {
          conversationId: conversation._id,
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      antMessage.error('Lỗi khi xóa cuộc trò chuyện');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="admin-chat-container">
      <Row gutter={16} style={{ height: '100vh' }}>
        {/* Conversations List */}
        <Col span={8}>
          <Card
            title={
              <div className="conversations-header">
                <Title level={4} style={{ margin: 0 }}>
                  <MessageOutlined /> Cuộc trò chuyện
                </Title>
                <Tooltip title="Làm mới">
                  <Button
                    icon={<ReloadOutlined />}
                    size="small"
                    onClick={loadConversations}
                    loading={loading}
                  />
                </Tooltip>
              </div>
            }
            bodyStyle={{
              padding: 0,
              height: 'calc(100vh - 140px)',
              overflow: 'auto',
            }}
          >
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : conversations.length === 0 ? (
              <Empty description="Chưa có cuộc trò chuyện nào" />
            ) : (
              <List
                dataSource={conversations}
                renderItem={(conversation) => (
                  <List.Item
                    className={`conversation-item ${
                      selectedConversation?._id === conversation._id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="Xóa cuộc trò chuyện"
                        description={`Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện với ${conversation.sender.fullName}?`}
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          deleteConversation(conversation);
                        }}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          title="Xóa cuộc trò chuyện"
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge
                          dot={isUserOnline(conversation.sender._id)}
                          color={
                            isUserOnline(conversation.sender._id)
                              ? 'green'
                              : 'default'
                          }
                        >
                          <Avatar
                            icon={<UserOutlined />}
                            src={conversation.sender.avatar}
                          />
                        </Badge>
                      }
                      title={
                        <div className="conversation-title">
                          <Text strong>{conversation.sender.fullName}</Text>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              count={conversation.unreadCount}
                              size="small"
                            />
                          )}
                        </div>
                      }
                      description={
                        <div className="conversation-preview">
                          <Text ellipsis className="last-message">
                            {conversation.lastMessage.content}
                          </Text>
                          <Text type="secondary" className="message-time">
                            {formatMessageTime(
                              conversation.lastMessage.createdAt
                            )}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Chat Messages */}
        <Col span={16}>
          {selectedConversation ? (
            <Card
              title={
                <div className="chat-header">
                  <div className="user-info">
                    <Badge
                      dot={isUserOnline(selectedConversation.sender._id)}
                      color={
                        isUserOnline(selectedConversation.sender._id)
                          ? 'green'
                          : 'default'
                      }
                    >
                      <Avatar
                        icon={<UserOutlined />}
                        src={selectedConversation.sender.avatar}
                        size="large"
                      />
                    </Badge>
                    <div className="user-details">
                      <Title level={5} style={{ margin: 0 }}>
                        {selectedConversation.sender.fullName}
                      </Title>
                      <Text type="secondary">
                        {isUserOnline(selectedConversation.sender._id)
                          ? 'Đang hoạt động'
                          : 'Ngoại tuyến'}
                      </Text>
                    </div>
                  </div>
                  <div className="connection-status">
                    <Badge
                      status={connected ? 'success' : 'error'}
                      text={connected ? 'Đã kết nối' : 'Mất kết nối'}
                    />
                  </div>
                </div>
              }
              bodyStyle={{ padding: 0 }}
            >
              {/* Messages Area */}
              <div className="messages-container">
                {messagesLoading ? (
                  <div className="loading-container">
                    <Spin size="large" />
                    <Text>Đang tải tin nhắn...</Text>
                  </div>
                ) : messages.length === 0 ? (
                  <Empty description="Chưa có tin nhắn nào" />
                ) : (
                  <div className="messages-list">
                    {messages.map((message, index) => {
                      // Admin message: bên phải, màu xanh
                      // User message: bên trái, màu xám
                      const isOwnMessage = message.isFromAdmin;

                      return (
                        <div
                          key={message._id || index}
                          className={`message-item ${
                            isOwnMessage ? 'admin' : 'user'
                          }`}
                        >
                          {!isOwnMessage && (
                            <Avatar
                              size="small"
                              icon={<UserOutlined />}
                              src={message.senderId?.avatar}
                              className="message-avatar"
                            />
                          )}
                          <div className="message-content">
                            <div
                              className={`message-bubble ${
                                isOwnMessage ? 'admin' : 'user'
                              }`}
                            >
                              <Text className="message-text">
                                {message.content}
                              </Text>
                              {/* Chỉ hiện button xóa cho tin nhắn user (không phải admin) */}
                              {!isOwnMessage && (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  className="delete-message-btn"
                                  onClick={() => deleteMessage(message._id)}
                                  danger
                                  title="Xóa tin nhắn"
                                />
                              )}
                            </div>
                            <Text type="secondary" className="message-time">
                              {formatMessageTime(message.createdAt)}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="input-container">
                <div className="input-wrapper">
                  <TextArea
                    placeholder="Nhập tin nhắn trả lời..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={handleKeyPress}
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    className="message-input"
                    disabled={!connected}
                  />
                  <Tooltip
                    title={connected ? 'Gửi tin nhắn' : 'Đang kết nối...'}
                  >
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !connected}
                      className="send-button"
                    />
                  </Tooltip>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <Empty
                description="Chọn một cuộc trò chuyện để bắt đầu"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AdminChatPage;
