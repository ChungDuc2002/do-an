import React from 'react';
import { Link } from 'react-router-dom';
import LoginIcon from '../Icons/LoginIcon';
import NewUserIcon from './../Icons/NewUserIcon';
import HeartIcon from '../Icons/HeartIcon';
import { Badge, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import './header.scss';

const HeaderClient = () => {
  const auth = localStorage.getItem('authSon');

  const menuItems = [
    {
      key: '0',
      label: (
        <div className="user-info">
          <Avatar size="large" src={auth?.avatar} />
          <span className="user-name">{auth?.fullName || 'User Name'}</span>
        </div>
      ),
      style: { padding: '10px' },
    },
    { type: 'divider' },

    {
      key: '1',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      onClick: () => {},
    },
    {
      key: '2',
      label: 'Thông tin tài khoản',
      icon: <SettingOutlined />,
      onClick: () => {},
    },
    {
      key: '3',
      label: 'Hướng dẫn sử dụng',
      icon: <HomeOutlined />,
      onClick: () => {},
    },
    { type: 'divider' },
    {
      key: '3',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: () => {
        localStorage.removeItem('authSon');
        window.location.reload();
      },
    },
  ];

  return (
    <div className="wrapper-header">
      <div className="container">
        <div className="wrapper-header-logo">
          <h2>Phongtro123.com</h2>
        </div>
        <div className="wrapper-header-nav">
          <ul>
            <li>Phòng trọ</li>
            <li>Nhà nguyên căn</li>
            <li>Căn hộ</li>
            <li>Blog</li>
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
                  <Badge count={1}>
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
                    src={
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyJU-aP5i--kHv6H-gjavFsq-tD-a6oe1-Kw&s'
                    }
                    style={{ cursor: 'pointer' }}
                  />
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
