import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Image, Button, Empty, Spin, message } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.scss';

const InfoRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserId = async () => {
      const token = JSON.parse(localStorage.getItem('authSon'));
      if (!token) {
        message.error('Bạn cần đăng nhập để xem thông tin này');
        navigate('/login');
        return;
      }

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
        message.error('Lỗi khi lấy thông tin user');
      }
    };
    getUserId();
  }, [navigate]);

  useEffect(() => {
    const fetchBookedRooms = async () => {
      if (!userId) return;

      const token = JSON.parse(localStorage.getItem('authSon'));
      if (!token) {
        message.error('Bạn cần đăng nhập để xem thông tin này');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/payos/user-booked-rooms/${userId}`,
          {
            headers: {
              token: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setBookedRooms(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching booked rooms:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          message.error('Phiên đăng nhập đã hết hạn');
          navigate('/login');
        } else {
          message.error('Lỗi khi lấy danh sách phòng đã đặt cọc');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookedRooms();
    }
  }, [userId, navigate]);

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  // Tính số tiền còn cần thanh toán
  const calculateRemainingAmount = (roomPrice, depositAmount) => {
    const remaining = roomPrice - depositAmount;
    return remaining > 0 ? remaining : 0;
  };

  const getRoomTypeText = (type) => {
    switch (type) {
      case 'nha-nguyen-can':
        return 'Nhà nguyên căn';
      case 'phong-tro':
        return 'Phòng trọ';
      case 'can-ho':
        return 'Căn hộ';
      default:
        return type;
    }
  };

  const getAmenityText = (amenity) => {
    const amenityMap = {
      wifi: 'Wifi',
      air_conditioner: 'Điều hòa',
      water_heater: 'Nóng lạnh',
      refrigerator: 'Tủ lạnh',
      washing_machine: 'Máy giặt',
      parking: 'Chỗ để xe',
      elevator: 'Thang máy',
      drying_area: 'Chỗ phơi đồ',
      yard: 'Sân bãi',
    };
    return amenityMap[amenity] || amenity;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Confirm':
        return 'green';
      case 'Processing':
        return 'blue';
      case 'Cancel':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'Confirm':
        return 'Đã xác nhận';
      case 'Processing':
        return 'Đang xử lý';
      case 'Cancel':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleViewRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải danh sách phòng đã đặt cọc...</p>
      </div>
    );
  }

  if (!bookedRooms || bookedRooms.length === 0) {
    return (
      <div className="booked-rooms-container">
        <Empty
          description="Bạn chưa đặt cọc phòng nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/rooms')}>
            Tìm phòng ngay
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="booked-rooms-container">
      <div className="page-header">
        <div className="header-top">
          <div>
            <h2>Phòng đã đặt cọc ({bookedRooms.length})</h2>
            <p>Danh sách các phòng bạn đã đặt cọc thành công</p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {bookedRooms.length > 0 && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-label">Tổng số phòng:</span>
              <span className="stat-value">{bookedRooms.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng tiền cọc:</span>
              <span className="stat-value">
                {formatPrice(
                  bookedRooms.reduce(
                    (total, room) => total + room.depositAmount,
                    0
                  )
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Còn thiếu:</span>
              <span className="stat-value">
                {formatPrice(
                  bookedRooms.reduce(
                    (total, room) =>
                      total +
                      calculateRemainingAmount(
                        room.roomInfo.price,
                        room.depositAmount
                      ),
                    0
                  )
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {bookedRooms.map((booking) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={8} key={booking.orderId}>
            <Card
              className="booked-room-card"
              hoverable
              cover={
                <div className="room-image-container">
                  <Image
                    alt={booking.roomInfo.title}
                    src={`http://localhost:5000${booking.roomInfo.images[0]}`}
                    className="room-image"
                    preview={false}
                  />
                  <div className="status-overlay">
                    <Tag color={getStatusColor(booking.status_payRoom)}>
                      {getStatusText(booking.status_payRoom)}
                    </Tag>
                  </div>
                </div>
              }
              actions={[
                <Button
                  key="view"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewRoom(booking.roomInfo._id)}
                >
                  Xem chi tiết
                </Button>,
              ]}
            >
              <div className="room-content">
                <h3 className="room-title">{booking.roomInfo.title}</h3>

                <div className="room-info">
                  <p className="room-address">
                    📍 {booking.roomInfo.address.street},{' '}
                    {booking.roomInfo.address.ward}
                  </p>

                  <div className="room-details">
                    <span className="room-type">
                      <Tag color="blue">
                        {getRoomTypeText(booking.roomInfo.type)}
                      </Tag>
                    </span>
                    <span className="room-acreage">
                      {booking.roomInfo.acreage}m²
                    </span>
                  </div>

                  <div className="amenities">
                    {booking.roomInfo.amenities
                      ?.slice(0, 3)
                      .map((amenity, index) => (
                        <Tag key={index} color="cyan" size="small">
                          {getAmenityText(amenity)}
                        </Tag>
                      ))}
                    {booking.roomInfo.amenities?.length > 3 && (
                      <span className="more-amenities">
                        +{booking.roomInfo.amenities.length - 3} tiện ích khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="pricing-info">
                  <div className="price-row">
                    <span className="label">Giá thuê:</span>
                    <span className="price">
                      {formatPrice(booking.roomInfo.price)}/tháng
                    </span>
                  </div>
                  <div className="price-row">
                    <span className="label">Tiền cọc:</span>
                    <span className="deposit-price">
                      {formatPrice(booking.depositAmount)}
                    </span>
                  </div>
                  <div className="price-row">
                    <span className="label">Còn thiếu:</span>
                    <span className="remaining-price">
                      {formatPrice(
                        calculateRemainingAmount(
                          booking.roomInfo.price,
                          booking.depositAmount
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div className="booking-info">
                  <div className="booking-date">
                    <span className="label">Ngày đặt cọc:</span>
                    <span className="date">
                      {formatDate(booking.bookingDate)}
                    </span>
                  </div>
                  <div className="order-code">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="code">#{booking.orderCode}</span>
                  </div>
                </div>

                {/* {booking.roomInfo.owner && (
                  <div className="owner-info">
                    <h4>Thông tin chủ phòng:</h4>
                    <div className="owner-details">
                      <p>👤 {booking.roomInfo.owner.fullName}</p>
                      {booking.roomInfo.owner.phone && (
                        <p>
                          <PhoneOutlined /> {booking.roomInfo.owner.phone}
                        </p>
                      )}
                      {booking.roomInfo.owner.email && (
                        <p>
                          <MailOutlined /> {booking.roomInfo.owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                )} */}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default InfoRooms;
