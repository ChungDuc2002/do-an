import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Button,
  Pagination,
  Space,
  Tag,
  Popconfirm,
  message,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import './style.scss';

const { Option } = Select;

const ManagerRoomPage = () => {
  // States cho filters
  const [selectedType, setSelectedType] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [selectedStatus, setSelectedStatus] = useState(null);

  // State cho pagination và data
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch rooms data
  const fetchRooms = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/room/getAllRooms',
        {
          params: {
            page: currentPage,
            limit: 3,
            ...params,
          },
        }
      );
      setRooms(response.data.docs);
      setTotalRooms(response.data.totalDocs);
    } catch (error) {
      message.error('Lỗi khi tải danh sách phòng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Search rooms with filters
  const handleFilter = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 3,
      };

      if (selectedType) params.type = selectedType;
      if (selectedStatus) params.status = selectedStatus;
      if (priceRange.min > 0) params.minPrice = priceRange.min;
      if (priceRange.max > 0) params.maxPrice = priceRange.max;

      const response = await axios.get('http://localhost:5000/room/search', {
        params,
      });

      if (response.data.success) {
        setRooms(response.data.data.docs);
        setTotalRooms(response.data.data.totalDocs);
        setCurrentPage(1);
      } else {
        message.error('Không tìm thấy kết quả phù hợp');
      }
    } catch (error) {
      message.error('Lỗi khi tìm kiếm phòng: ' + error.message);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRooms({ page });
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/room/deleteRoom/${id}`);
      message.success('Xóa phòng thành công');
      fetchRooms({ page: currentPage });
    } catch (error) {
      message.error('Lỗi khi xóa phòng');
      console.error(error);
    }
  };

  const handleEdit = (id) => {};

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="wrapper-manager-rooms">
      <Row gutter={24}>
        {/* Filter section remains the same */}
        <Col span={8} className="filter-section">
          <Card title="Bộ lọc tìm kiếm" style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="filter-item">
                <label>Loại phòng:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn loại phòng"
                  onChange={(value) => setSelectedType(value)}
                >
                  <Option value="phong-tro">Phòng trọ</Option>
                  <Option value="nha-nguyen-can">Nhà nguyên căn</Option>
                  <Option value="can-ho">Căn hộ</Option>
                </Select>
              </div>

              <div className="filter-item">
                <label>Khoảng giá:</label>
                <Space>
                  <InputNumber
                    placeholder="Từ"
                    style={{ width: '100%' }}
                    onChange={(value) =>
                      setPriceRange({ ...priceRange, min: value })
                    }
                  />
                  <span>-</span>
                  <InputNumber
                    placeholder="Đến"
                    style={{ width: '100%' }}
                    onChange={(value) =>
                      setPriceRange({ ...priceRange, max: value })
                    }
                  />
                </Space>
              </div>

              <div className="filter-item">
                <label>Trạng thái:</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn trạng thái"
                  onChange={(value) => setSelectedStatus(value)}
                >
                  <Option value="available">Còn trống</Option>
                  <Option value="rented">Đã cho thuê</Option>
                  <Option value="maintenance">Đang bảo trì</Option>
                </Select>
              </div>

              <Button type="primary" block onClick={handleFilter}>
                Áp dụng
              </Button>
            </Space>
          </Card>
        </Col>
        {/* Rooms section */}
        <Col span={16} className="rooms-section">
          <Row gutter={[16, 16]}>
            {loading ? (
              <div
                style={{ width: '100%', textAlign: 'center', padding: '20px' }}
              >
                <Spin size="large" />
              </div>
            ) : (
              rooms.map((room) => (
                <Col span={24} key={room._id}>
                  <Card
                    hoverable
                    className="room-card"
                    style={{ width: '100%' }}
                  >
                    <Row gutter={16}>
                      <Col span={6}>
                        <img
                          src={
                            room.images[0]?.startsWith('http')
                              ? room.images[0]
                              : `http://localhost:5000${room.images[0]}`
                          }
                          alt={room.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://placehold.co/600x400?text=No+Image';
                          }}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                          }}
                        />
                      </Col>
                      <Col span={14}>
                        <h3>{room.title}</h3>
                        <div className="room-info">
                          <p className="price">
                            <span className="label">Giá:</span>{' '}
                            {room.price.toLocaleString()} VNĐ/tháng
                          </p>
                          <p className="address">
                            <span className="label">Địa chỉ:</span>{' '}
                            {room.address.street}, {room.address.ward} ,{' '}
                            {room.address.city}
                          </p>
                          <p className="type">
                            <span className="label">Loại phòng:</span>
                            <Tag color="blue">
                              {room.type === 'phong-tro'
                                ? 'Phòng trọ'
                                : room.type === 'nha-nguyen-can'
                                ? 'Nhà nguyên căn'
                                : 'Căn hộ'}
                            </Tag>
                          </p>
                          <div className="amenities">
                            <span className="label">Tiện nghi :</span>
                            <div className="amenities-tags">
                              {room.amenities.map((item, index) => (
                                <Tag key={index} color="cyan">
                                  {item === 'wifi'
                                    ? 'Wifi'
                                    : item === 'air_conditioner'
                                    ? 'Điều hòa'
                                    : item === 'water_heater'
                                    ? 'Nóng lạnh'
                                    : item === 'refrigerator'
                                    ? 'Tủ lạnh'
                                    : item === 'washing_machine'
                                    ? 'Máy giặt'
                                    : 'Chỗ để xe'}
                                </Tag>
                              ))}
                            </div>
                          </div>
                          <div className="amenities">
                            <span className="label">Trạng thái : </span>
                            <div className="amenities-tags">
                              <Tag
                                className="status-tag"
                                color={
                                  room.status === 'available' ? 'green' : 'red'
                                }
                              >
                                {room.status === 'available'
                                  ? 'Còn trống'
                                  : 'Đã thuê'}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={4}>
                        <Space direction="vertical">
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(room._id)}
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Bạn có chắc muốn xóa phòng này?"
                            onConfirm={() => handleDelete(room._id)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                          >
                            <Button danger icon={<DeleteOutlined />}>
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          <div className="pagination-section">
            <Pagination
              current={currentPage}
              total={totalRooms}
              pageSize={3}
              onChange={handlePageChange}
              showTotal={(total) => `Tổng ${total} phòng`}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerRoomPage;
