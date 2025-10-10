import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoginIcon from '../Icons/LoginIcon';
import NewUserIcon from './../Icons/NewUserIcon';
import HeartIcon from '../Icons/HeartIcon';
import logo from '../../Assets/logo_page.png';
import { Badge, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import './header.scss';

const HeaderClient = () => {
  const [nameAvatar, setNameAvatar] = useState();
  const [userId, setUserId] = useState('');
  const [favoriteCount, setFavoriteCount] = useState(0);

  const auth = localStorage.getItem('authSon');

  useEffect(() => {
    const getUserById = async () => {
      try {
        if (auth) {
          // Kiểm tra auth tồn tại trước khi gọi API
          const token = JSON.parse(auth);
          const result = await axios.get('http://localhost:5000/info', {
            headers: {
              token: `Bearer ${token}`,
            },
          });
          setUserId(result.data._id);
          setNameAvatar(result.data.fullName);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUserById();
  }, [auth]);

  const fetchFavorite = async () => {
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/favorite/getFavorites/${userId}`
        );

        setFavoriteCount(response.data.length);
      } catch (error) {
        console.log('error', error);
      }
    }
  };
  useEffect(() => {
    fetchFavorite();
    const interval = setInterval(() => {
      fetchFavorite();
    }, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const menuItems = [
    {
      key: '0',
      label: (
        <div className="user-info">
          <Avatar
            size="large"
            style={{
              cursor: 'pointer',
              backgroundColor: '#0247a6',
            }}
          >
            {nameAvatar ? nameAvatar.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <span className="user-name">{nameAvatar || 'User Name'}</span>
        </div>
      ),
      style: { padding: '10px' },
    },
    { type: 'divider' },

    {
      key: '1',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => {
        window.location.href = '/profile/1';
      },
    },
    {
      key: '2',
      label: 'Thông tin tài khoản',
      icon: <SettingOutlined />,
      onClick: () => {
        window.location.href = '/profile/2';
      },
    },
    {
      key: '3',
      label: 'Thông tin lưu trú',
      icon: <HomeOutlined />,
      onClick: () => {
        window.location.href = '/profile/2';
      },
    },
    { type: 'divider' },
    {
      key: '3',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: () => {
        localStorage.removeItem('authSon');
        window.location.reload();
        window.location.href = '/';
      },
    },
  ];

  return (
    <div className="wrapper-header">
      <div className="container">
        <div className="wrapper-header-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={logo} alt="" />
          </Link>
        </div>
        <div className="wrapper-header-nav">
          <ul>
            <li>
              <Link to="/rooms?type=phong-tro">Phòng trọ</Link>
            </li>
            <li>
              <Link to="/rooms?type=nha-nguyen-can">Nhà nguyên căn</Link>
            </li>
            <li>
              <Link to="/rooms?type=can-ho">Căn hộ</Link>
            </li>
            <li>
              <Link to="">Blog</Link>
            </li>
          </ul>
        </div>

        {!auth ? (
          <div className="wrapper-header-action">
            <div className="login">
              <LoginIcon />
              <Link to="/login" className="auth-button">
                Đăng nhập
              </Link>
            </div>
            <div className="register">
              <NewUserIcon />
              <Link to="/register" className="auth-button">
                Đăng ký
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="wrapper-header-user-actions">
              <div className="favorite">
                <Link to="/favorite">
                  <Badge count={favoriteCount}>
                    <HeartIcon />
                  </Badge>
                </Link>
              </div>
              <div className="user-avatar">
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  arrow
                >
                  <Avatar
                    size="large"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#0247a6',
                    }}
                  >
                    {nameAvatar ? nameAvatar.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </Dropdown>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeaderClient;
