import React, { useEffect, useState } from 'react';
import { Card, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import Meta from 'antd/es/card/Meta';
import StoreLocationIcon from './../Icons/StoreLocationIcon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const CardPage = ({ rooms }) => {
  const [userId, setUserId] = useState('');

  const auth = localStorage.getItem('authSon');
  const navigate = useNavigate();

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

  const handleNavigateToRoom = () => {
    navigate(`/rooms/${rooms._id}`);
  };

  const handleAddToFavorite = async () => {
    if (auth) {
      try {
        const data = {
          userId,
          roomId: rooms._id,
        };
        await axios.post('http://localhost:5000/favorite/addToFavorite', data);
        toast.success('Thêm vào yêu thích thành công !');
      } catch (err) {
        toast.error('Phòng đã có trong danh sách yêu thích !');
      }
    } else {
      toast.error('Vui lòng đăng nhập để thêm phòng vào mục yêu thích');
    }
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
    >
      <Meta title={rooms.title} onClick={handleNavigateToRoom} />
      <Space>
        <span className="icon">
          <HeartFilled onClick={handleAddToFavorite} />
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
    </Card>
  );
};

export default CardPage;
