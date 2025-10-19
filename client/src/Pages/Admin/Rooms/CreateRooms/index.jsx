import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Radio,
  Upload,
  Button,
  Checkbox,
  Modal,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const CreateRoomPage = () => {
  const [modalAddNewRoom, setModalAddNewRoom] = useState(false);

  useEffect(() => {
    document.title = 'Tạo mới phòng';
  }, []);

  const handleCancel = () => {
    setModalAddNewRoom(false);
  };

  return (
    <div className="wrapper-create-rooms">
      <div className="wrapper-create-rooms-group-btn">
        <Button
          className="btn-add-product"
          onClick={() => {
            setModalAddNewRoom(!modalAddNewRoom);
          }}
        >
          Thêm mới phòng
        </Button>
      </div>
      <div className="wrapper-create-rooms-background">
        <img
          src="https://plus.unsplash.com/premium_photo-1701157947036-4497cf679494?q=80&w=544&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="background"
        />
        <img
          src="https://images.unsplash.com/photo-1520014384091-f75776a1ca4f?q=80&w=436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="background"
          style={{ height: '550px' }}
        />
        <img
          src="https://images.unsplash.com/photo-1648766426924-2f08483b30aa?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="background"
        />
      </div>
      <Modal
        open={modalAddNewRoom}
        closeIcon={false}
        footer={false}
        width={1200}
      >
        <AddNewRoom onCancel={handleCancel} />
      </Modal>
    </div>
  );
};

function AddNewRoom({ onCancel }) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [ruleImages, setRuleImages] = useState([]);

  const handleImageChange = ({ fileList }) => {
    setImageList(fileList);
  };

  const handleRuleImagesChange = ({ fileList }) => {
    setRuleImages(fileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );
  const amenitiesList = [
    { label: 'Wifi', value: 'wifi' },
    { label: 'Điều hòa', value: 'air_conditioner' },
    { label: 'Nóng lạnh', value: 'water_heater' },
    { label: 'Tủ lạnh', value: 'refrigerator' },
    { label: 'Máy giặt', value: 'washing_machine' },
    { label: 'Chỗ để xe', value: 'parking' },
    { label: 'Thang máy', value: 'elevator' },
    { label: 'Chỗ phơi đồ', value: 'drying_area' },
    { label: 'Sân bãi', value: 'yard' },
  ];

  const roomTypes = [
    { label: 'Phòng trọ', value: 'phong-tro' },
    { label: 'Nhà nguyên căn', value: 'nha-nguyen-can' },
    { label: 'Căn hộ', value: 'can-ho' },
  ];

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Basic information
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('type', values.type);
      formData.append('acreage', values.acreage.toString());
      formData.append('electricity', values.electricity.toString());
      formData.append('water', values.water.toString());

      // Convert amenities array to JSON string
      formData.append('amenities', JSON.stringify(values.amenities));

      // Add address as a single string
      // const fullAddress = `${values.address.street}, ${values.address.ward}, ${values.address.district}, ${values.address.city}`;
      // formData.append('address', fullAddress);

      const addressData = {
        street: values.address.street,
        ward: values.address.ward,
        district: values.address.district,
        city: 'Đà Nẵng', // Luôn luôn set thành "Đà Nẵng"
        location: {
          type: 'Point',
          coordinates: [0, 0], // Có thể thêm coordinates thực tế nếu có
        },
      };
      formData.append('address', JSON.stringify(addressData));

      // Add images
      imageList.forEach((file) => {
        formData.append('images', file.originFileObj);
      });

      // Add rule images
      ruleImages.forEach((file) => {
        formData.append('rules', file.originFileObj);
      });

      const response = await axios.post(
        'http://localhost:5000/room/createRoom',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        toast.success('Tạo phòng thành công!');
        form.resetFields();
        setImageList([]);
        setRuleImages([]);
        onCancel();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + error.message);
      console.error('Create room error:', error);
    }
  };

  return (
    <div className="add-room-form">
      <h2>Thêm Phòng Mới</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="form-content"
      >
        <div className="flex">
          <div className="form-section">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input placeholder="Nhập tiêu đề phòng" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về phòng"
              />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá thuê (VNĐ/tháng)"
              rules={[{ required: true, message: 'Vui lòng nhập giá thuê!' }]}
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
            <Form.Item
              name="electricity"
              label="Tiền điện (VNĐ/tháng)"
              rules={[{ required: true, message: 'Vui lòng nhập tiền điện!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá tiền điện"
              />
            </Form.Item>
            <Form.Item
              name="water"
              label="Tiền nước (VNĐ/tháng)"
              rules={[{ required: true, message: 'Vui lòng nhập tiền nước!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá tiền nước"
              />
            </Form.Item>
            <Form.Item
              name="acreage"
              label="Diện tích (m²)"
              rules={[
                { required: true, message: 'Vui lòng nhập diện tích phòng!' },
                {
                  type: 'number',
                  min: 1,
                  message: 'Diện tích phải lớn hơn 0!',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="Nhập diện tích phòng"
                formatter={(value) => `${value}`}
                parser={(value) => value.replace(/\D/g, '')}
              />
            </Form.Item>
          </div>

          <div className="form-section">
            <Form.Item
              name="type"
              label="Loại phòng"
              rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
            >
              <Radio.Group
                options={roomTypes}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>

            <Form.Item
              name="amenities"
              label="Tiện nghi"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn ít nhất một tiện nghi!',
                },
              ]}
            >
              <Checkbox.Group className="amenities-group">
                {amenitiesList.map((item) => (
                  <Checkbox key={item.value} value={item.value}>
                    {item.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </div>
        </div>
        <div className="flex">
          <div className="form-section">
            <Form.Item
              name="images"
              label="Hình ảnh phòng"
              rules={[
                { required: true, message: 'Vui lòng tải lên ít nhất 1 ảnh!' },
              ]}
            >
              <Upload
                listType="picture-card"
                fileList={imageList}
                onChange={handleImageChange}
                beforeUpload={() => false}
                multiple
                maxCount={6}
              >
                {imageList.length >= 6 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </div>
          <div className="form-section address-section">
            <h3>Địa chỉ</h3>
            <Form.Item
              name={['address', 'street']}
              label="Đường"
              rules={[{ required: true, message: 'Vui lòng nhập tên đường!' }]}
            >
              <Input placeholder="Nhập tên đường" />
            </Form.Item>

            <div className="address-group">
              <Form.Item
                name={['address', 'ward']}
                label="Phường/Xã"
                rules={[{ required: true }]}
              >
                <Input placeholder="Phường/Xã" />
              </Form.Item>

              <Form.Item
                name={['address', 'district']}
                label="Quận/Huyện"
                rules={[{ required: true }]}
              >
                <Input placeholder="Quận/Huyện" />
              </Form.Item>

              <Form.Item
                name={['address', 'city']}
                label="Thành phố"
                initialValue="Đà Nẵng"
              >
                <Input
                  value="Đà Nẵng"
                  disabled
                  placeholder="Đà Nẵng"
                  style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                />
              </Form.Item>
            </div>
          </div>

          <div className="form-section">
            <Form.Item
              name="ruleImages"
              label="Hình ảnh nội quy"
              rules={[
                { required: true, message: 'Vui lòng tải lên ảnh nội quy!' },
              ]}
            >
              <Upload
                listType="picture-card"
                fileList={ruleImages}
                onChange={handleRuleImagesChange}
                beforeUpload={() => false}
                multiple
                maxCount={3}
              >
                {ruleImages.length >= 3 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </div>

          <div className="form-footer">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Tạo phòng
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default CreateRoomPage;
