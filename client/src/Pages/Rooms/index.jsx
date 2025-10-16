import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import Card from '../../Components/Card';
import HotCard from '../../Components/HotCard';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.scss';

const RoomsPage = () => {
  const [room, setRoom] = useState();
  const location = useLocation();

  const getTypeFromPath = (path) => {
    const query = new URLSearchParams(path);
    return query.get('type');
  };

  const currentType = getTypeFromPath(location.search);

  useEffect(() => {
    const getRoomByType = async () => {
      try {
        // Nếu là phòng HOT, sử dụng API riêng
        if (currentType === 'hot') {
          const res = await axios.get('http://localhost:5000/room/getHotRooms');
          setRoom(res.data.data || []);
        } else {
          // Các loại phòng khác
          const res = await axios.get(
            `http://localhost:5000/room/getTypeRoom/${currentType}`
          );
          setRoom(res.data);
        }
      } catch (err) {
        console.log(err);
        setRoom([]);
      }
    };

    if (currentType) {
      getRoomByType();
    }
  }, [currentType]);

  // Helper function để lấy title theo type
  const getPageTitle = (type) => {
    switch (type) {
      case 'hot':
        return 'Phòng HOT 🔥';
      case 'phong-tro':
        return 'Phòng trọ';
      case 'nha-nguyen-can':
        return 'Nhà nguyên căn';
      case 'can-ho':
        return 'Căn hộ';
      default:
        return 'Danh sách phòng';
    }
  };

  return (
    <div className="container wrapper-rooms">
      {/* Title cho trang */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1>{getPageTitle(currentType)}</h1>
        {currentType === 'hot' && (
          <p style={{ color: '#666', fontSize: '16px' }}>
            Những phòng được quan tâm nhiều nhất
          </p>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {room?.map((item, index) => (
          <Col
            className="item-favorite"
            key={index}
            xs={24}
            sm={24}
            md={12}
            lg={12}
            xl={5}
          >
            {currentType === 'hot' ? (
              <HotCard rooms={item} />
            ) : (
              <Card rooms={item} />
            )}
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomsPage;
