import React, { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import Card from '../../Components/Card';
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
        const res = await axios.get(
          `http://localhost:5000/room/getTypeRoom/${currentType}`
        );
        setRoom(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getRoomByType();
  }, [currentType]);

  return (
    <div className="container wrapper-rooms">
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
            <Card rooms={item} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RoomsPage;
