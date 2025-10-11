import React, { useEffect, useState } from 'react';
import {
  ProductOutlined,
  UserOutlined,
  StockOutlined,
  FilterOutlined,
  HomeOutlined,
  WechatWorkOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import NotFound from '../../Pages/NotFound';
import './style.scss';

const AdminLayout = () => {
  const authAdmin = JSON.parse(localStorage.getItem('authAdminSon'));

  const handleLogOut = () => {
    clearLocalStorage();
    localStorage.removeItem('authAdmin');
    navigate('/login');
  };

  const navigation = [
    {
      disabled: true,
      key: '/admin',
      label: 'Admin Panel',

      style: {
        fontSize: '2rem',
        borderBottom: '1px solid #333',
        borderRadius: '0',
        color: 'white',
        textAlign: 'center',
        padding: '40px 0',
      },
    },
    {
      key: 'sub5',
      label: 'Thống kê',
      icon: <StockOutlined />,
      children: [
        {
          key: '/admin',
          label: 'Thống kê tổng quan',
        },
      ],
    },
    // {
    //   key: 'sub3',
    //   label: 'Chat Box',
    //   icon: <WechatWorkOutlined />,
    //   children: [
    //     {
    //       key: '/admin/chat',
    //       label: 'Chat Box',
    //     },
    //   ],
    // },
    {
      key: 'sub1',
      label: 'Trang chủ',
      icon: <HomeOutlined />,
      children: [
        {
          key: '/admin/manager-banner',
          label: 'Quản lý banner',
        },
        {
          key: '/admin/manager-contact',
          label: 'Quản lý liên hệ',
        },
        {
          key: '/admin/manager-comments',
          label: 'Quản lý phản hồi',
        },
        {
          key: '/admin/manager-featured-category',
          label: 'Quản lý danh mục nổi bật',
        },
      ],
    },
    {
      disabled: true,
      label: 'Quản lý',
      style: {
        borderBottom: '1px solid #333',
        borderRadius: '0',
      },
    },
    {
      key: 'sub2',
      label: 'Tài khoản',
      icon: <UserOutlined />,
      children: [
        {
          key: '/admin/manager-users',
          label: 'Quản lý người dùng',
        },
      ],
    },
    {
      key: 'sub4',
      label: 'Phòng',
      icon: <ProductOutlined />,
      children: [
        {
          key: '/admin/create-room',
          label: 'Tạo mới phòng',
        },
        {
          key: '/admin/manager-rooms',
          label: 'Quản lý phòng',
        },
        {
          key: '/admin/manager-booked-rooms',
          label: 'Quản lý phòng đã đặt',
        },
      ],
    },
    {
      type: 'divider',
    },

    {
      disabled: true,
      label: 'Công cụ khác',
      style: {
        borderBottom: '1px solid #333',
        borderRadius: '0',
      },
    },
    {
      key: 'sub6',
      label: 'Khác',
      icon: <FilterOutlined />,
      children: [
        {
          key: '/login',
          label: 'Đăng xuất',
          onClick: handleLogOut,
        },
      ],
    },
  ];
  const navigate = useNavigate();

  // ? LOGIC MENU BREARDCRUM -----------------------
  const [curNav, setCurNav] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    const storedNav = localStorage.getItem('currentNav');
    if (storedNav) {
      setCurNav(storedNav);
      setSelectedKeys([storedNav]);
    }
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key) {
      navigate(key);
      setCurNav(key);
      localStorage.setItem('currentNav', key);
      setSelectedKeys([key]);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('currentNav');
    setCurNav('');
  };

  //* Lấy ra parent của menu
  const findParent = (menu, key) => {
    for (const item of menu) {
      if (item.children && item.children.some((child) => child.key === key)) {
        return item;
      }
    }
    return menu.find((item) => item?.key === key);
  };

  //* Lấy ra menu hiện tại
  const findCurrent = (menu, key) => {
    for (const item of menu) {
      if (item.children && item.children.some((child) => child.key === key)) {
        return item.children.find((child) => child.key === key);
      }
    }
    return menu.find((item) => item?.key === key);
  };

  const RenderHeader = () => {
    const currentNav = findCurrent(navigation, curNav);
    const currenParent = findParent(navigation, curNav);

    if (!currentNav) {
      // Chuyển hướng người dùng đến trang mặc định hoặc hiển thị thông báo
      return null;
    }
    return (
      <div className="admin-layout-nav">
        <div className="admin-layout-title">
          <div className="admin-layout-title-left">
            <h1>
              {currentNav?.icon} {currentNav?.label}{' '}
            </h1>
            <p>{currentNav?.desc}</p>
          </div>
          <div className="admin-layout-title-right">
            <Breadcrumb>
              <Breadcrumb.Item>
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span>{currenParent?.label}</span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>{currentNav?.label}</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      {authAdmin ? (
        <div className="wrapper-admin-layout">
          <Menu
            defaultSelectedKeys={selectedKeys}
            selectedKeys={selectedKeys}
            mode="inline"
            theme="dark"
            onClick={handleMenuClick}
            items={navigation}
            className="menu-admin-layout"
          />
          <div className="content">
            <div className="breadcrumb">
              <RenderHeader />
            </div>
            <div className="children">
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default AdminLayout;
