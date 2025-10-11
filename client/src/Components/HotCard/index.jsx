import React, { useEffect, useState } from 'react';
import { Card, Space, Tag, Button, Badge } from 'antd';
import {
  HeartFilled,
  HeartOutlined,
  FireFilled,
  EyeOutlined,
} from '@ant-design/icons';
import Meta from 'antd/es/card/Meta';
import StoreLocationIcon from './../Icons/StoreLocationIcon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const HotCard = ({ rooms }) => {
  const [userId, setUserId] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const auth = localStorage.getItem('authSon');
  const navigate = useNavigate();

  // Helper function để lấy thông tin trạng thái phòng
  const getRoomStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return {
          text: 'Còn trống',
          color: 'green',
          canBook: true,
          description: 'Phòng sẵn sàng cho thuê',
        };
      case 'rented':
        return {
          text: 'Đã được thuê',
          color: 'red',
          canBook: false,
          description: 'Phòng đã có người thuê',
        };
      case 'maintenance':
        return {
          text: 'Đang bảo trì',
          color: 'orange',
          canBook: false,
          description: 'Phòng tạm thời không thể cho thuê',
        };
      default:
        return {
          text: 'Không xác định',
          color: 'gray',
          canBook: false,
          description: 'Trạng thái không rõ',
        };
    }
  };

  useEffect(() => {
    const getIdUser = async () => {
      const token = JSON.parse(localStorage.getItem('authSon'));
      if (token) {
        try {
          const result = await axios.get('http://localhost:5000/info', {
            headers: {
              token: `Bearer ${token}`,
            },
          });
          if (result.status === 200) {
            setUserId(result.data._id);
          }
        } catch (err) {
          console.log(err);
        }
      }
    };
    getIdUser();
  }, []);

  // Kiểm tra xem phòng đã được thêm vào yêu thích chưa
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (userId && rooms._id) {
        try {
          const response = await axios.get(
            `http://localhost:5000/favorite/checkFavorite`,
            {
              params: {
                userId: userId,
                roomId: rooms._id,
              },
            }
          );
          setIsFavorite(response.data.isFavorite);
        } catch (err) {
          console.log('Error checking favorite status:', err);
          setIsFavorite(false);
        }
      }
    };
    checkFavoriteStatus();
  }, [userId, rooms._id]);

  const handleNavigateToRoom = () => {
    navigate(`/rooms/${rooms._id}`);
  };

  const handleToggleFavorite = async () => {
    if (auth) {
      try {
        const data = {
          userId,
          roomId: rooms._id,
        };

        if (isFavorite) {
          await axios.delete(
            'http://localhost:5000/favorite/removeFromFavorite',
            {
              data: data,
            }
          );
          setIsFavorite(false);
          toast.success('Đã xóa khỏi danh sách yêu thích !');
        } else {
          await axios.post(
            'http://localhost:5000/favorite/addToFavorite',
            data
          );
          setIsFavorite(true);
          toast.success('Thêm vào yêu thích thành công !');
        }
      } catch (err) {
        if (isFavorite) {
          toast.error('Không thể xóa khỏi yêu thích !');
        } else {
          toast.error('Phòng đã có trong danh sách yêu thích !');
        }
      }
    } else {
      toast.error('Vui lòng đăng nhập để thêm phòng vào mục yêu thích');
    }
  };

  // Format số lượt xem
  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views;
  };

  // Đảm bảo có status, mặc định là 'available' nếu không có
  const roomStatus = rooms.status || 'available';
  const statusInfo = getRoomStatusInfo(roomStatus);

  return (
    <Badge.Ribbon
      text={
        <span className="hot-ribbon">
          <FireFilled /> HOT
        </span>
      }
      color="#ff4d4f"
      placement="start"
    >
      <Card
        hoverable={statusInfo.canBook}
        className={`hot-room-card ${!statusInfo.canBook ? 'disabled' : ''}`}
        cover={
          <div className="card-cover">
            <img
              alt={rooms.title}
              src={
                rooms.images[0]?.startsWith('http')
                  ? rooms.images[0]
                  : `http://localhost:5000${rooms.images[0]}`
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />

            {/* Badge lượt xem */}
            <div className="views-badge">
              <EyeOutlined />
              <span>{formatViews(rooms.views)}</span>
            </div>

            <div className={`status-overlay status-${roomStatus}`}>
              <Tag color={statusInfo.color} className="status-tag">
                {statusInfo.text}
              </Tag>
            </div>
          </div>
        }
      >
        <Meta
          title={rooms.title}
          onClick={statusInfo.canBook ? handleNavigateToRoom : undefined}
          className={!statusInfo.canBook ? 'disabled-title' : ''}
        />

        {/* Icon yêu thích */}
        {statusInfo.canBook && auth && (
          <Space>
            <span className="icon">
              {isFavorite ? (
                <HeartFilled
                  onClick={handleToggleFavorite}
                  style={{ color: '#ff4d4f' }}
                />
              ) : (
                <HeartOutlined
                  onClick={handleToggleFavorite}
                  style={{ color: '#8c8c8c' }}
                />
              )}
            </span>
          </Space>
        )}

        <Space>
          <span className="price">
            Giá thuê : {new Intl.NumberFormat().format(rooms.price)}đ
          </span>
        </Space>

        <Space
          style={{
            display: 'flex',
          }}
        >
          <span className="type">
            {rooms.type === 'nha-nguyen-can'
              ? 'Nhà nguyên căn'
              : rooms.type === 'phong-tro'
              ? 'Phòng trọ'
              : rooms.type === 'can-ho'
              ? 'Căn hộ'
              : rooms.type}
          </span>
          <span className="acreage">{rooms.acreage}m²</span>
        </Space>

        <Space>
          <span className="address">
            <StoreLocationIcon />{' '}
            <span>
              {rooms.address.street} , {rooms.address.ward} ,{' '}
              {rooms.address.district} , {rooms.address.city}
            </span>
          </span>
        </Space>

        {/* Hiển thị thông báo trạng thái khi không thể đặt phòng */}
        {!statusInfo.canBook && (
          <div className="status-message">
            <span className={`message-text status-${roomStatus}`}>
              {statusInfo.description}
            </span>
          </div>
        )}

        {/* Nút đặt cọc chỉ hiển thị khi phòng còn trống */}
        {statusInfo.canBook && auth && (
          <div className="booking-actions">
            <Button
              type="primary"
              onClick={() => navigate(`/payment/${rooms._id}`)}
              className="booking-button"
            >
              Đặt cọc phòng
            </Button>
          </div>
        )}

        {/* Thông báo cần đăng nhập nếu chưa đăng nhập */}
        {statusInfo.canBook && !auth && (
          <div className="booking-actions">
            <Button
              type="default"
              onClick={() => navigate('/login')}
              className="login-button"
            >
              Đăng nhập để đặt phòng
            </Button>
          </div>
        )}
      </Card>
    </Badge.Ribbon>
  );
};

export default HotCard;
