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
  Modal,
  Form,
  Input,
  Upload,
  Checkbox,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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

  // State cho modal chỉnh sửa
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

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

  // Format number với dấu phẩy
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function để lấy thông tin trạng thái phòng
  const getRoomStatusInfo = (status) => {
    switch (status) {
      case 'available':
        return {
          text: 'Còn trống',
          color: 'green',
        };
      case 'rented':
        return {
          text: 'Đã thuê',
          color: 'red',
        };
      case 'maintenance':
        return {
          text: 'Đang bảo trì',
          color: 'orange',
        };
      default:
        return {
          text: 'Không xác định',
          color: 'default',
        };
    }
  };

  // Xử lý khi click nút Sửa
  const handleEdit = (roomId) => {
    const room = rooms.find((r) => r._id === roomId);
    if (room) {
      setEditingRoom(room);

      // Set initial form values
      form.setFieldsValue({
        title: room.title,
        description: room.description,
        price: room.price,
        electricity: room.electricity,
        water: room.water,
        acreage: room.acreage,
        type: room.type,
        status: room.status,
        amenities: room.amenities || [],
        street: room.address?.street,
        ward: room.address?.ward,
        district: room.address?.district,
        city: room.address?.city,
      });

      // Set current images
      const currentImages =
        room.images?.map((img, index) => ({
          uid: `-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url: img.startsWith('http') ? img : `http://localhost:5000${img}`,
          response: img,
        })) || [];

      setFileList(currentImages);
      setEditModalVisible(true);
    }
  };

  // Xử lý submit form chỉnh sửa
  const handleEditSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Append form data
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('electricity', values.electricity || 0);
      formData.append('water', values.water || 0);
      formData.append('acreage', values.acreage);
      formData.append('type', values.type);
      formData.append('status', values.status);

      // Append address
      const address = {
        street: values.street,
        ward: values.ward,
        district: values.district,
        city: values.city,
      };
      formData.append('address', JSON.stringify(address));

      // Append amenities
      formData.append('amenities', JSON.stringify(values.amenities || []));

      // Append new images
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      await axios.put(
        `http://localhost:5000/room/updateRoom/${editingRoom._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      message.success('Cập nhật phòng thành công');
      setEditModalVisible(false);
      setEditingRoom(null);
      form.resetFields();
      setFileList([]);
      fetchRooms({ page: currentPage });
    } catch (error) {
      message.error('Lỗi khi cập nhật phòng: ' + error.message);
      console.error('Update error:', error);
    }
  };

  // Xử lý upload hình ảnh
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Xử lý preview hình ảnh
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
  };

  // Convert file to base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Đóng modal
  const handleModalCancel = () => {
    setEditModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
    setFileList([]);
  };

  // Initial fetch
  useEffect(() => {
    const loadRooms = async () => {
      await fetchRooms();
    };
    loadRooms();
  }, []);

  return (
    <div className="wrapper-manager-rooms">
      <Row gutter={24}>
        {/* Filter section remains the same */}
        <Col span={6} className="filter-section">
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
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={(value) =>
                      setPriceRange({ ...priceRange, min: value })
                    }
                  />
                  <span>-</span>
                  <InputNumber
                    placeholder="Đến"
                    style={{ width: '100%' }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
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
        <Col span={18} className="rooms-section">
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
                      <Col span={13}>
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
                              {(() => {
                                const statusInfo = getRoomStatusInfo(
                                  room.status
                                );
                                return (
                                  <Tag
                                    className="status-tag"
                                    color={statusInfo.color}
                                  >
                                    {statusInfo.text}
                                  </Tag>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={5}>
                        <Space
                          direction="horizontal"
                          style={{ display: 'flex' }}
                        >
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

      {/* Modal chỉnh sửa phòng */}
      <Modal
        title="Chỉnh sửa thông tin phòng"
        open={editModalVisible}
        onCancel={handleModalCancel}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="edit-room-form"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tiêu đề phòng"
                name="title"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề phòng' },
                ]}
              >
                <Input placeholder="Nhập tiêu đề phòng" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập mô tả phòng" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Giá thuê (VNĐ/tháng)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập giá thuê"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Tiền điện (VNĐ/kWh)" name="electricity">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập giá điện"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Tiền nước (VNĐ/m³)" name="water">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập giá nước"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Diện tích (m²)"
                name="acreage"
                rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập diện tích"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Loại phòng"
                name="type"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại phòng' },
                ]}
              >
                <Select placeholder="Chọn loại phòng">
                  <Option value="phong-tro">Phòng trọ</Option>
                  <Option value="nha-nguyen-can">Nhà nguyên căn</Option>
                  <Option value="can-ho">Căn hộ</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: 'Vui lòng chọn trạng thái' },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="available">Còn trống</Option>
                  <Option value="rented">Đã cho thuê</Option>
                  <Option value="maintenance">Đang bảo trì</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Tiện nghi" name="amenities">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}>
                      <Checkbox value="wifi">Wifi</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="air_conditioner">Điều hòa</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="water_heater">Nóng lạnh</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="refrigerator">Tủ lạnh</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="washing_machine">Máy giặt</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="parking">Chỗ để xe</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Đường/Số nhà"
                name="street"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input placeholder="Nhập số nhà, tên đường" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: 'Vui lòng nhập phường/xã' }]}
              >
                <Input placeholder="Nhập phường/xã" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[
                  { required: true, message: 'Vui lòng nhập quận/huyện' },
                ]}
              >
                <Input placeholder="Nhập quận/huyện" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tỉnh/Thành phố"
                name="city"
                rules={[
                  { required: true, message: 'Vui lòng nhập tỉnh/thành phố' },
                ]}
              >
                <Input placeholder="Nhập tỉnh/thành phố" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Hình ảnh phòng">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  multiple
                >
                  {fileList.length >= 6 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Cập nhật phòng
                  </Button>
                  <Button onClick={handleModalCancel}>Hủy</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
export default ManagerRoomPage;
