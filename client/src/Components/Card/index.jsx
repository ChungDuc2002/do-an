import React from 'react';
import { Card, Space } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Meta from 'antd/es/card/Meta';
import StoreLocationIcon from './../Icons/StoreLocationIcon';
import axios from 'axios';
import './style.scss';

const handleNavigateToRoom = () => {};

const CardPage = ({ rooms }) => {
  return (
    <div className="ts">
      <Card
        hoverable
        cover={
          <>
            <img
              alt="example"
              src="https://tromoi.com/uploads/static/phong_tro_da_nang/Ph%E1%BA%A1m%20V%E1%BA%A5n/pham_van_h5.jpg"
            />
          </>
        }
      >
        <Meta
          // title={rooms.title}
          title={'Phong 02'}
          onClick={handleNavigateToRoom}
        />
        <Space>
          <span className="icon">
            <HeartOutlined />
          </span>
        </Space>
        <Space>
          <span className="price">
            Giá thuê :
            {/* {new Intl.NumberFormat().format(rooms.price)}đ
             */}{' '}
            1.200.000đ
          </span>
        </Space>
        <Space>
          <span className="type">Nhà nguyên căn</span>
        </Space>
        <Space>
          <span className="address">
            <StoreLocationIcon /> 211 Phan Huỳnh Điểu , Ngũ Hành Sơn , Đà Nẵng
          </span>
        </Space>
      </Card>
    </div>
  );
};

export default CardPage;
