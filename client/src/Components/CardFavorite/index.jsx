import React, { useEffect, useState } from 'react';
import { Card, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import Meta from 'antd/es/card/Meta';
import StoreLocationIcon from './../Icons/StoreLocationIcon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const CardPage = ({ rooms, onDelete }) => {
  const [userId, setUserId] = useState('');
  const [favorite, setFavorite] = React.useState([]);

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

  useEffect(() => {
    const getFavorite = async () => {
      if (userId) {
        try {
          const res = await axios.get(
            `http://localhost:5000/favorite/getFavorites/${userId}`
          );
          console.log(res.data);
          setFavorite(res.data);
        } catch (error) {
          console.log(error.message);
        }
      }
    };
    getFavorite();
  }, [userId]);

  const handleNavigateToRoom = () => {
    navigate(`/rooms/${rooms._id}`);
  };

  const handleDeleteFavorite = async (idRoom) => {
    try {
      const result = await axios.delete(
        `http://localhost:5000/favorite/removeFavorite/${userId}/${idRoom}`
      );

      if (result.data.success) {
        toast.success('Đã xóa khỏi danh sách yêu thích');
        onDelete && onDelete(idRoom);

        // Cập nhật lại danh sách favorite local
        setFavorite((prev) =>
          prev.filter((item) => item.roomId._id !== idRoom)
        );
      } else {
        toast.error(result.data.message || 'Xóa thất bại');
      }
    } catch (err) {
      toast.error('Xóa thất bại: ' + err.message);
      console.error('Delete favorite error:', err);
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
          <HeartFilled onClick={() => handleDeleteFavorite(rooms._id)} />
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
