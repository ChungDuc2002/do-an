import React, { useEffect } from 'react';
import NotCartIcon from '../../Components/Icons/NotCartIcon';
import { Link, Meta } from 'react-router-dom';
import { Card, Col, Image, Row, Space } from 'antd';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CardFavorite from '../../Components/CardFavorite';

import './style.scss';
import StoreLocationIcon from '../../Components/Icons/StoreLocationIcon';

const FavoritePage = () => {
  const [favorite, setFavorite] = React.useState([]);
  const [userId, setUserId] = React.useState('');

  const auth = localStorage.getItem('authSon');

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

  const handleDeleteFavorite = (roomId) => {
    // Cập nhật state favorite sau khi xóa
    setFavorite((prev) => prev.filter((item) => item.roomId._id !== roomId));
  };

  return (
    <div className="wrapper-favorite">
      {!auth ? (
        <div className="wrapper-not-login">
          <NotCartIcon />
          <p>Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <Link to="/login">Đăng nhập</Link>
        </div>
      ) : (
        <div className="container wrapper-favorite-body">
          <h1 className="title">Danh sách phòng yêu thích</h1>
          {favorite.length === 0 ? (
            <div className="wrapper-not-favorite">
              <NotCartIcon />
              <p>Chưa có phòng trong danh sách yêu thích</p>
              <Link to="/">Xem ngay</Link>
            </div>
          ) : (
            <div className="wrapper-list-favorite">
              <Row gutter={[16, 16]}>
                {favorite.map((item, index) => (
                  <Col
                    className="item-favorite"
                    key={index}
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={5}
                  >
                    <CardFavorite
                      rooms={item.roomId}
                      onDelete={handleDeleteFavorite}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
