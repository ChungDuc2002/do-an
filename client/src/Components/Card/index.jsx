import React from 'react';
import { Card, Space } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Meta from 'antd/es/card/Meta';
import StoreLocationIcon from './../Icons/StoreLocationIcon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.scss';

const CardPage = ({ rooms }) => {
  const navigate = useNavigate();
  const handleNavigateToRoom = () => {
    navigate(`/rooms/${rooms._id}`);
  };
  return (
    <Card
      hoverable
      cover={
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
      }
      onClick={handleNavigateToRoom}
    >
      <Meta title={rooms.title} />
      <Space>
        <span className="icon">
          <HeartOutlined />
        </span>
      </Space>
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
            : rooms.type === 'nha-tro'
            ? 'Nhà trọ'
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
    </Card>
  );
};

export default CardPage;
