import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Tag,
  Pagination,
  Spin,
  Empty,
  Image,
  Space,
  Typography,
  Modal,
  Descriptions,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './style.scss';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ManagerBookedRooms = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchOrderCode, setSearchOrderCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  const pageSize = 8; // 4 phòng x 2 hàng = 8 phòng

  // Fetch booked rooms
  const fetchBookedRooms = async (page = 1, orderCode = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
        orderCode,
        status,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await axios.get(
        'http://localhost:5000/payRoom/getAllBookedRooms',
        { params }
      );
      console.log('API Response:', response.data);
      console.log('Params sent:', params);

      setBookedRooms(response.data.data.docs || []);
      setTotal(response.data.data.totalDocs);
    } catch (error) {
      console.error('Error fetching booked rooms:', error);
      toast.error('Lỗi tải danh sách phòng đã thuê');
      setBookedRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookedRooms();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchOrderCode(value);
    setCurrentPage(1);
    fetchBookedRooms(1, value, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchBookedRooms(1, searchOrderCode, value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBookedRooms(page, searchOrderCode, statusFilter);
  };

  // Handle view detail
  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    setDetailModalVisible(true);
  };

  // Handle update status
  const handleUpdateStatus = (room) => {
    setSelectedRoom(room);
    setUpdateModalVisible(true);
  };

  // Update room status
  const updateRoomStatus = async (newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/payRoom/updateStatus/${selectedRoom._id}`,
        { status_payRoom: newStatus }
      );

      toast.success('Cập nhật trạng thái thành công');
      setUpdateModalVisible(false);
      fetchBookedRooms(currentPage, searchOrderCode, statusFilter);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: { color: 'orange', text: 'Chờ xử lý' },
      Confirm: { color: 'green', text: 'Đã xác nhận' },
      Processing: { color: 'blue', text: 'Đang xử lý' },
      Cancel: { color: 'red', text: 'Đã hủy' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="wrapper-manager-booked-rooms">
      {/* Search and Filter Section */}
      <Card className="search-section">
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Search
              placeholder="Tìm kiếm theo mã đơn hàng..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              size="large"
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              <Option value="Pending">Chờ xử lý</Option>
              <Option value="Confirm">Đã xác nhận</Option>
              <Option value="Processing">Đang xử lý</Option>
              <Option value="Cancel">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setSearchOrderCode('');
                setStatusFilter('');
                setCurrentPage(1);
                fetchBookedRooms();
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Results Section */}
      <Card className="results-section" style={{ marginTop: 16 }}>
        <Title level={4}>Danh sách phòng đã thuê ({total} đơn)</Title>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : bookedRooms.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {bookedRooms.map((booking) => (
                <Col span={6} key={booking._id}>
                  <Card
                    hoverable
                    className="booking-card"
                    cover={
                      booking.rooms[0]?.roomId?.images?.[0] ? (
                        <Image
                          alt={booking.rooms[0].roomId.title}
                          src={
                            booking.rooms[0].roomId.images[0].startsWith('http')
                              ? booking.rooms[0].roomId.images[0]
                              : `http://localhost:5000${booking.rooms[0].roomId.images[0]}`
                          }
                          height={200}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="no-image">Không có ảnh</div>
                      )
                    }
                    actions={[
                      <EyeOutlined
                        key="view"
                        onClick={() => handleViewDetail(booking)}
                      />,
                      <EditOutlined
                        key="edit"
                        onClick={() => handleUpdateStatus(booking)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong>{booking.rooms[0]?.roomId?.title}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            #{booking.orderCode}
                          </Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <div>
                            <UserOutlined /> {booking.userId?.fullName}
                          </div>
                          <div>
                            <DollarOutlined />{' '}
                            {formatPrice(booking.totalAmount)} VNĐ
                          </div>
                          <div>{getStatusTag(booking.status_payRoom)}</div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {formatDate(booking.createdAt)}
                          </Text>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn`
                }
              />
            </div>
          </>
        ) : (
          <Empty
            description="Không có đơn phòng nào"
            style={{ margin: '50px 0' }}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn phòng"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRoom && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn hàng" span={2}>
              <Badge status="processing" text={selectedRoom.orderCode} />
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedRoom.userId?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRoom.userId?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedRoom.userId?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedRoom.status_payRoom)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền" span={2}>
              <Text strong style={{ color: '#52c41a' }}>
                {formatPrice(selectedRoom.totalAmount)} VNĐ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt" span={2}>
              {formatDate(selectedRoom.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
      >
        {selectedRoom && (
          <div>
            <p>
              <strong>Đơn hàng:</strong> #{selectedRoom.orderCode}
            </p>
            <p>
              <strong>Trạng thái hiện tại:</strong>{' '}
              {getStatusTag(selectedRoom.status_payRoom)}
            </p>
            <div style={{ marginTop: 16 }}>
              <Button
                block
                style={{
                  marginBottom: 8,
                  backgroundColor: '#52c41a',
                  color: 'white',
                }}
                onClick={() => updateRoomStatus('Confirm')}
              >
                Xác nhận đơn
              </Button>
              <Button
                block
                style={{
                  marginBottom: 8,
                  backgroundColor: '#1890ff',
                  color: 'white',
                }}
                onClick={() => updateRoomStatus('Processing')}
              >
                Đang xử lý
              </Button>
              <Button
                block
                style={{
                  marginBottom: 8,
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                }}
                onClick={() => updateRoomStatus('Cancel')}
              >
                Hủy đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerBookedRooms;
