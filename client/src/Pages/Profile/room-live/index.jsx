import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Image,
  Tag,
  Space,
  Divider,
  Empty,
  Spin,
  Button,
  Modal,
  Descriptions,
} from 'antd';
import { EyeOutlined, CoffeeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './style.scss';

const { Text, Paragraph } = Typography;

const RoomLivePage = () => {
  const [liveRooms, setLiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserId = async () => {
      const token = JSON.parse(localStorage.getItem('authSon'));
      if (!token) {
        toast.error('Bạn cần đăng nhập để xem thông tin này');
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
        toast.error('Lỗi khi lấy thông tin user');
      }
    };
    getUserId();
  }, [navigate]);

  useEffect(() => {
    // Fetch danh sách phòng đang ở
    const fetchLiveRooms = async () => {
      if (!userId) return;

      const token = JSON.parse(localStorage.getItem('authSon'));
      if (!token) {
        toast.error('Bạn cần đăng nhập để xem thông tin này');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/payRoom/getUserLiveRooms/${userId}`,
          {
            headers: {
              token: `Bearer ${token}`,
            },
          }
        );

        setLiveRooms(response.data.data || []);
      } catch (error) {
        console.error('Error fetching live rooms:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Phiên đăng nhập đã hết hạn');
          navigate('/login');
        } else {
          toast.error('Lỗi tải thông tin phòng đang ở');
        }
        setLiveRooms([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLiveRooms();
    }
  }, [userId, navigate]);

  // Xem chi tiết phòng
  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    setDetailModalVisible(true);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Format ngày
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Tính số ngày đã ở
  const calculateDaysLived = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Chuyển đổi tiện ích sang tiếng Việt
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
      kitchen: 'Bếp',
      balcony: 'Ban công',
      security: 'Bảo vệ',
      gym: 'Phòng gym',
      swimming_pool: 'Hồ bơi',
      garden: 'Sân vườn',
      terrace: 'Sân thượng',
    };
    return amenityMap[amenity] || amenity;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  return (
    <div className="live-rooms-container">
      <div className="page-header">
        <div className="header-top">
          <div>
            <h2>Phòng đang ở ({liveRooms.length})</h2>
            <p>Danh sách các phòng bạn đang sinh sống</p>
          </div>
          <Button
            icon={<EyeOutlined />}
            onClick={() => window.location.reload()}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {liveRooms.length > 0 && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-label">Tổng số phòng:</span>
              <span className="stat-value">{liveRooms.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng tiền thuê/tháng:</span>
              <span className="stat-value">
                {formatPrice(
                  liveRooms.reduce(
                    (total, room) =>
                      total + (room.rooms[0]?.roomId?.price || 0),
                    0
                  )
                )}{' '}
                VNĐ
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ngày TB đã ở:</span>
              <span className="stat-value">
                {liveRooms.length > 0
                  ? Math.round(
                      liveRooms.reduce(
                        (total, room) =>
                          total + calculateDaysLived(room.updatedAt),
                        0
                      ) / liveRooms.length
                    )
                  : 0}{' '}
                ngày
              </span>
            </div>
          </div>
        )}
      </div>

      {liveRooms.length > 0 ? (
        <Row gutter={[16, 16]}>
          {liveRooms.map((booking) => {
            const room = booking.rooms[0]?.roomId;
            const daysLived = calculateDaysLived(booking.updatedAt);

            return (
              <Col xs={24} sm={24} md={12} lg={8} xl={8} key={booking._id}>
                <Card
                  className="live-room-card"
                  hoverable
                  cover={
                    <div className="room-image-container">
                      <Image
                        alt={room?.title}
                        src={
                          room?.images?.[0]?.startsWith('http')
                            ? room.images[0]
                            : `http://localhost:5000${room?.images?.[0]}`
                        }
                        className="room-image"
                        preview={false}
                      />
                      <div className="status-overlay">
                        <Tag color="green">Đang ở</Tag>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetail(booking)}
                    >
                      Xem chi tiết
                    </Button>,
                  ]}
                >
                  <div className="room-content">
                    <h3 className="room-title">{room?.title}</h3>

                    <div className="room-info">
                      <p className="room-address">
                        📍 {room?.address?.street}, {room?.address?.ward}
                      </p>

                      <div className="room-details">
                        <span className="room-type">
                          <Tag color="blue">{room?.type}</Tag>
                        </span>
                        <span className="room-acreage">{room?.acreage}m²</span>
                      </div>

                      <div className="amenities">
                        {room?.amenities?.slice(0, 3).map((amenity, index) => (
                          <Tag key={index} color="cyan" size="small">
                            {getAmenityText(amenity)}
                          </Tag>
                        ))}
                        {room?.amenities?.length > 3 && (
                          <span className="more-amenities">
                            +{room.amenities.length - 3} tiện ích khác
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pricing-info">
                      <div className="price-row">
                        <span className="label">Giá thuê:</span>
                        <span className="price">
                          {formatPrice(room?.price)} VNĐ/tháng
                        </span>
                      </div>
                      <div className="price-row">
                        <span className="label">Đã ở:</span>
                        <span className="deposit-price">{daysLived} ngày</span>
                      </div>
                      <div className="price-row">
                        <span className="label">Bắt đầu ở:</span>
                        <span className="remaining-price">
                          {formatDate(booking.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="booking-info">
                      <div className="order-code">
                        <span className="label">Mã đặt phòng:</span>
                        <span className="code">#{booking.orderCode}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty
          description="Bạn chưa có phòng nào đang ở"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/rooms')}>
            Tìm phòng ngay
          </Button>
        </Empty>
      )}

      {/* Detail Modal */}
      <Modal
        title="Thông tin chi tiết phòng đang ở"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedRoom && (
          <div className="room-detail-modal">
            {/* Room Images */}
            <div className="room-images">
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {selectedRoom.rooms[0]?.roomId?.images
                    ?.slice(0, 4)
                    .map((image, index) => (
                      <Col span={6} key={index}>
                        <Image
                          src={
                            image.startsWith('http')
                              ? image
                              : `http://localhost:5000${image}`
                          }
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </Col>
                    ))}
                </Row>
              </Image.PreviewGroup>
            </div>

            <Divider />

            {/* Room Information */}
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Tên phòng" span={2}>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {selectedRoom.rooms[0]?.roomId?.title}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ" span={2}>
                <Text>
                  {selectedRoom.rooms[0]?.roomId?.address?.street},{' '}
                  {selectedRoom.rooms[0]?.roomId?.address?.ward},{' '}
                  {selectedRoom.rooms[0]?.roomId?.address?.district},{' '}
                  {selectedRoom.rooms[0]?.roomId?.address?.city}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Loại phòng">
                <Tag color="blue">{selectedRoom.rooms[0]?.roomId?.type}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Diện tích">
                <Text>{selectedRoom.rooms[0]?.roomId?.acreage} m²</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giá thuê">
                <Text strong style={{ color: '#52c41a' }}>
                  {formatPrice(selectedRoom.rooms[0]?.roomId?.price)} VNĐ/tháng
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày bắt đầu ở">
                <Text>{formatDate(selectedRoom.updatedAt)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Số ngày đã ở">
                <Tag color="orange">
                  {calculateDaysLived(selectedRoom.updatedAt)} ngày
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Mã đặt phòng">
                <Text code>{selectedRoom.orderCode}</Text>
              </Descriptions.Item>

              {selectedRoom.rooms[0]?.roomId?.amenities && (
                <Descriptions.Item label="Tiện ích" span={2}>
                  <Space wrap>
                    {selectedRoom.rooms[0].roomId.amenities.map(
                      (amenity, index) => (
                        <Tag
                          key={index}
                          icon={<CoffeeOutlined />}
                          color="purple"
                        >
                          {getAmenityText(amenity)}
                        </Tag>
                      )
                    )}
                  </Space>
                </Descriptions.Item>
              )}

              {selectedRoom.rooms[0]?.roomId?.description && (
                <Descriptions.Item label="Mô tả" span={2}>
                  <Paragraph>
                    {selectedRoom.rooms[0].roomId.description}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomLivePage;
