import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Tag, Spin, Image } from 'antd';
import StoreLocationIcon from '../../Components/Icons/StoreLocationIcon';
import {
  DollarOutlined,
  FieldTimeOutlined,
  HarmonyOSOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import './style.scss';

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm loading state

  useEffect(() => {
    document.title = 'Chi tiết phòng';
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/room/getRoomById/${id}`
        );
        console.log(response.data);

        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="loading">
        <Spin size="large" />
      </div>
    );
  if (!room) return <div>Không tìm thấy thông tin phòng</div>;

  return (
    <div className="container wrapper-detail-room">
      <h1 className="title">{room.title}</h1>

      <div className="room-type">
        <Tag color="blue">
          {room.type === 'nha-nguyen-can'
            ? 'Nhà nguyên căn'
            : room.type === 'phong-tro'
            ? 'Phòng trọ'
            : 'Căn hộ'}
        </Tag>
      </div>

      {room.address && (
        <p className="address">
          <StoreLocationIcon />
          <span>
            {room.address.street}, {room.address.ward}, {room.address.district},{' '}
            {room.address.city}
          </span>
        </p>
      )}

      <div className="images-container">
        <div className="main-images">
          {room.images && room.images.length > 0 && (
            <Image
              src={`http://localhost:5000${room.images[0]}`}
              alt="Ảnh chính"
              className="main-image"
            />
          )}
        </div>
        <div className="sub-images">
          {room.images &&
            room.images
              .slice(1)
              .map((image, index) => (
                <Image
                  key={index}
                  src={`http://localhost:5000${image}`}
                  alt={`Ảnh ${index + 2}`}
                  className="sub-image"
                />
              ))}
        </div>
      </div>

      <div className="room-info">
        <div className="price-section">
          <h2>Thông tin giá</h2>
          <p className="price">
            <p style={{ display: 'flex', gap: '10px' }}>
              <DollarOutlined style={{ color: 'black' }} />
              Giá thuê :
            </p>
            <span>{room.price.toLocaleString()} VNĐ/tháng</span>
          </p>
          <p>
            <p style={{ display: 'flex', gap: '10px' }}>
              <HarmonyOSOutlined style={{ color: 'black' }} />
              Diện tích :
            </p>
            <span>{room.acreage} m²</span>
          </p>
          <p>
            <p style={{ display: 'flex', gap: '10px' }}>
              <DollarOutlined style={{ color: 'black' }} />
              Tiền điện :
            </p>{' '}
            <span>{room.electricity?.toLocaleString()} VNĐ/số</span>
          </p>
          <p>
            <p style={{ display: 'flex', gap: '10px' }}>
              <DollarOutlined style={{ color: 'black' }} />
              Tiền nước :
            </p>
            <span>{room.water?.toLocaleString()} VNĐ/khối</span>
          </p>
          <p>
            <p style={{ display: 'flex', gap: '10px' }}>
              <FieldTimeOutlined style={{ color: 'black' }} />
              Ngày đăng:{' '}
            </p>
            <span>{moment(room.createdAt).format('DD/MM/YYYY')}</span>
          </p>
        </div>

        <div className="description-section">
          <h2>Mô tả chi tiết</h2>
          <p>{room.description}</p>
        </div>

        <div className="amenities-section">
          <h2>Tiện nghi</h2>
          <div className="amenities-list">
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
      </div>
    </div>
  );
};

export default RoomDetail;
