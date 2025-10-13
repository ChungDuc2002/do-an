import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Image,
  Tag,
  Empty,
  Spin,
  Button,
  message,
  Modal,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './style.scss';

const RoomPayFailPage = () => {
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(null);
  const [userId, setUserId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
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
    const fetchFailedPayments = async () => {
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
          `http://localhost:5000/api/payos/user-failed-payments/${userId}`,
          {
            headers: {
              token: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setFailedPayments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching failed payments:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          message.error('Phiên đăng nhập đã hết hạn');
          navigate('/login');
        } else {
          message.error('Lỗi khi lấy danh sách phòng thanh toán thất bại');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFailedPayments();
    }
  }, [userId, navigate]);

  // Format giá tiền
  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Format ngày
  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
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
      kitchen: 'Bếp',
      balcony: 'Ban công',
      elevator: 'Thang máy',
      security: 'Bảo vệ',
      gym: 'Phòng gym',
      swimming_pool: 'Hồ bơi',
      garden: 'Sân vườn',
      terrace: 'Sân thượng',
    };
    return amenityMap[amenity] || amenity;
  };

  // Xử lý thanh toán lại - hiển thị modal xác nhận
  const handleRetryPayment = (orderId) => {
    console.log('handleRetryPayment called with orderId:', orderId);

    const token = JSON.parse(localStorage.getItem('authSon'));
    if (!token) {
      message.error('Bạn cần đăng nhập để thực hiện thanh toán');
      navigate('/login');
      return;
    }

    console.log('About to show confirm modal');
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  // Refresh lại data
  const refreshFailedPayments = async () => {
    if (!userId) return;

    const token = JSON.parse(localStorage.getItem('authSon'));
    if (!token) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/payos/user-failed-payments/${userId}`,
        {
          headers: {
            token: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFailedPayments(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing failed payments:', error);
    }
  };

  // Thực hiện thanh toán lại
  const confirmRetryPayment = async () => {
    console.log(
      'User confirmed, starting payment retry for orderId:',
      selectedOrderId
    );

    const token = JSON.parse(localStorage.getItem('authSon'));

    try {
      setRetryLoading(selectedOrderId);
      setShowConfirmModal(false);

      console.log(
        'Making API call to:',
        `http://localhost:5000/api/payos/retry-payment/${selectedOrderId}`
      );
      console.log('With token:', token ? 'Token exists' : 'No token');

      const response = await axios.post(
        `http://localhost:5000/api/payos/retry-payment/${selectedOrderId}`,
        {},
        {
          headers: {
            token: `Bearer ${token}`,
          },
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        // Lưu thông tin để PaymentSuccess có thể sử dụng
        const paymentInfo = failedPayments.find(
          (p) => p.orderId === selectedOrderId
        );
        if (paymentInfo) {
          localStorage.setItem('currentOrderId', selectedOrderId);
          localStorage.setItem('currentUserId', userId);
          localStorage.setItem(
            'currentRooms',
            JSON.stringify([
              {
                roomId: paymentInfo.roomInfo._id,
                price: paymentInfo.totalAmount,
              },
            ])
          );
        }

        toast.success('Đang chuyển hướng đến trang thanh toán...');
        // Chuyển hướng đến trang thanh toán
        window.open(response.data.checkoutUrl, '_blank');

        // Sau 15 giây, refresh lại data để kiểm tra trạng thái thanh toán
        setTimeout(() => {
          refreshFailedPayments();
          toast.success('Đã làm mới danh sách phòng');
        }, 15000);
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Phiên đăng nhập đã hết hạn');
        navigate('/login');
      } else {
        message.error(
          error.response?.data?.message || 'Lỗi khi thực hiện thanh toán lại'
        );
      }
    } finally {
      setRetryLoading(null);
      setSelectedOrderId(null);
    }
  };

  // Hủy thanh toán
  const cancelRetryPayment = () => {
    console.log('User cancelled payment retry');
    setShowConfirmModal(false);
    setSelectedOrderId(null);
  };

  // Xem chi tiết phòng
  const handleViewRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải danh sách phòng thanh toán thất bại...</p>
      </div>
    );
  }

  if (!failedPayments || failedPayments.length === 0) {
    return (
      <div className="failed-payments-container">
        <Empty
          description="Bạn không có phòng nào thanh toán thất bại"
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
    <div className="failed-payments-container">
      <div className="page-header">
        <div className="header-top">
          <div>
            <h2>Thanh toán thất bại ({failedPayments.length})</h2>
            <p>Danh sách các phòng chưa thanh toán thành công</p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {failedPayments.length > 0 && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-label">Tổng số phòng:</span>
              <span className="stat-value">{failedPayments.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng tiền cọc:</span>
              <span className="stat-value">
                {formatPrice(
                  failedPayments.reduce(
                    (total, payment) => total + payment.totalAmount,
                    0
                  )
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Còn thiếu:</span>
              <span className="stat-value">
                {formatPrice(
                  failedPayments.reduce(
                    (total, payment) =>
                      total +
                      calculateRemainingAmount(
                        payment.roomInfo.price,
                        payment.totalAmount
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
        {failedPayments.map((payment) => (
          <Col xs={24} sm={24} md={12} lg={8} xl={8} key={payment.orderId}>
            <Card
              className="failed-payment-card"
              hoverable
              cover={
                <div className="room-image-container">
                  <Image
                    alt={payment.roomInfo.title}
                    src={`http://localhost:5000${payment.roomInfo.images[0]}`}
                    className="room-image"
                    preview={false}
                  />
                  <div className="status-overlay">
                    <Tag color="red">Thanh toán thất bại</Tag>
                  </div>
                </div>
              }
              actions={[
                <Button
                  key="view"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewRoom(payment.roomInfo._id)}
                >
                  Xem chi tiết
                </Button>,
                <Button
                  key="retry"
                  type="primary"
                  icon={<CreditCardOutlined />}
                  loading={retryLoading === payment.orderId}
                  onClick={() => handleRetryPayment(payment.orderId)}
                >
                  Thanh toán lại
                </Button>,
              ]}
            >
              <div className="room-content">
                <h3 className="room-title">{payment.roomInfo.title}</h3>

                <div className="room-info">
                  <p className="room-address">
                    📍 {payment.roomInfo.address.street},{' '}
                    {payment.roomInfo.address.ward}
                  </p>

                  <div className="room-details">
                    <span className="room-type">
                      <Tag color="blue">
                        {getRoomTypeText(payment.roomInfo.type)}
                      </Tag>
                    </span>
                    <span className="room-acreage">
                      {payment.roomInfo.acreage}m²
                    </span>
                  </div>

                  <div className="amenities">
                    {payment.roomInfo.amenities
                      ?.slice(0, 3)
                      .map((amenity, index) => (
                        <Tag key={index} color="cyan" size="small">
                          {getAmenityText(amenity)}
                        </Tag>
                      ))}
                    {payment.roomInfo.amenities?.length > 3 && (
                      <span className="more-amenities">
                        +{payment.roomInfo.amenities.length - 3} tiện ích khác
                      </span>
                    )}
                  </div>
                </div>

                <div className="pricing-info">
                  <div className="price-row">
                    <span className="label">Giá thuê:</span>
                    <span className="price">
                      {formatPrice(payment.roomInfo.price)}/tháng
                    </span>
                  </div>
                  <div className="price-row">
                    <span className="label">Tiền cọc:</span>
                    <span className="deposit-price">
                      {formatPrice(payment.totalAmount)}
                    </span>
                  </div>
                  <div className="price-row">
                    <span className="label">Còn thiếu:</span>
                    <span className="remaining-price">
                      {formatPrice(
                        calculateRemainingAmount(
                          payment.roomInfo.price,
                          payment.totalAmount
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div className="booking-info">
                  <div className="booking-date">
                    <span className="label">Ngày đặt cọc:</span>
                    <span className="date">
                      {formatDate(payment.bookingDate)}
                    </span>
                  </div>
                  <div className="order-code">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="code">#{payment.orderCode}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal xác nhận thanh toán lại */}
      <Modal
        title="Xác nhận thanh toán lại"
        open={showConfirmModal}
        onOk={confirmRetryPayment}
        onCancel={cancelRetryPayment}
        okText="Thanh toán"
        cancelText="Hủy"
        confirmLoading={retryLoading === selectedOrderId}
        centered
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          <ExclamationCircleOutlined
            style={{ color: '#faad14', fontSize: 22, marginRight: 16 }}
          />
          <span>
            Bạn có chắc chắn muốn thực hiện thanh toán lại cho phòng này?
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default RoomPayFailPage;
