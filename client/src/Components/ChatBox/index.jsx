import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Avatar,
  Typography,
  Empty,
  Spin,
  message as antMessage,
} from 'antd';
import {
  SendOutlined,
  CloseOutlined,
  MinusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import './style.scss';

const { Text } = Typography;
const { TextArea } = Input;

const ChatBox = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      initializeSocket();
      loadMessages();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('authSon');

    if (token) {
      const parsedToken = JSON.parse(token);

      socketRef.current = io('http://localhost:5000', {
        auth: { token: parsedToken },
      });

      socketRef.current.on('connect', () => {
        console.log('User connected to chat server');
        setConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('User disconnected from chat server');
        setConnected(false);
      });

      socketRef.current.on('new_message', (data) => {
        console.log('User received new message:', data);
        setMessages((prev) => [...prev, data.message]);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        antMessage.error('Không thể kết nối chat: ' + error.message);
        setConnected(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        antMessage.error(error.message || 'Lỗi kết nối chat');
      });
    } else {
      antMessage.error('Vui lòng đăng nhập để sử dụng chat');
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('authSon'));

      const response = await axios.get(
        'http://localhost:5000/chat/my-conversation',
        {
          headers: { token: `Bearer ${token}` },
          params: { limit: 50 },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.docs || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Không hiển thị error nếu chưa có conversation
      if (error.response?.status !== 404) {
        antMessage.error('Không thể tải tin nhắn');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || !connected) return;

    try {
      socketRef.current.emit('send_message', {
        content: newMessage.trim(),
        messageType: 'text',
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Lỗi khi gửi tin nhắn');
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
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function để render message content với clickable links
  const renderMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (!urlRegex.test(content)) {
      return <Text className="message-text">{content}</Text>;
    }

    const parts = content.split(urlRegex);

    return (
      <Text className="message-text">
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="message-link"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="chatbox-container">
      <Card
        className={`chatbox-card ${isMinimized ? 'minimized' : ''}`}
        title={
          <div className="chatbox-header">
            <div className="header-info">
              <Avatar size="small" icon={<UserOutlined />} />
              <Text strong>Hỗ trợ khách hàng</Text>
            </div>
            <div className="header-actions">
              <Button
                type="text"
                size="small"
                icon={<MinusOutlined />}
                onClick={() => setIsMinimized(!isMinimized)}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={onClose}
              />
            </div>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="messages-container">
              {loading ? (
                <div className="loading-container">
                  <Spin size="small" />
                  <Text>Đang tải tin nhắn...</Text>
                </div>
              ) : messages.length === 0 ? (
                <div className="welcome-message">
                  <Text>Chào bạn! Chúng tôi có thể giúp gì cho bạn?</Text>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((message, index) => {
                    const isOwnMessage = !message.isFromAdmin;

                    return (
                      <div
                        key={message._id || index}
                        className={`message-item ${
                          isOwnMessage ? 'own' : 'other'
                        }`}
                      >
                        {!isOwnMessage && (
                          <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            className="message-avatar"
                          />
                        )}
                        <div className="message-content">
                          {/* Room consultation message */}
                          {message.messageType === 'room_consultation' &&
                          message.roomInfo ? (
                            <div
                              className={`room-consultation-message ${
                                isOwnMessage ? 'own' : 'other'
                              }`}
                            >
                              <div className="room-card">
                                <div className="room-image">
                                  <img
                                    src={message.roomInfo.roomImage}
                                    alt={message.roomInfo.roomTitle}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        'https://placehold.co/300x200?text=No+Image';
                                    }}
                                  />
                                </div>
                                <div className="room-details">
                                  <Text strong className="room-title">
                                    {message.roomInfo.roomTitle}
                                  </Text>
                                  <Text className="room-price">
                                    💰{' '}
                                    {new Intl.NumberFormat().format(
                                      message.roomInfo.roomPrice
                                    )}
                                    đ/tháng
                                  </Text>
                                  <Text className="room-type">
                                    🏢 {message.roomInfo.roomType}
                                  </Text>
                                  <Button
                                    type="primary"
                                    size="small"
                                    className="room-detail-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(
                                        `/rooms/${message.roomInfo.roomId}`,
                                        '_blank'
                                      );
                                    }}
                                  >
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </div>
                              <div className="consultation-text">
                                {renderMessageContent(message.content)}
                              </div>
                            </div>
                          ) : (
                            /* Regular message */
                            <div
                              className={`message-bubble ${
                                isOwnMessage ? 'own' : 'other'
                              }`}
                            >
                              {renderMessageContent(message.content)}
                            </div>
                          )}
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
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={handleKeyPress}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className="message-input"
                  disabled={!connected}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !connected}
                  className="send-button"
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChatBox;
