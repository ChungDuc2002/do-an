import React, { useEffect, useState } from 'react';
import { Divider, Tabs } from 'antd';
import InformationProfile from './information';
import InfoRooms from './rooms';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import './style.scss';

const ProfilePage = () => {
  const { tabKey } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const getIdUser = async () => {
      const token = JSON.parse(localStorage.getItem('auth'));
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
    };
    getIdUser();
  }, []);

  const items = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      children: <InformationProfile />,
    },
    {
      key: '2',
      label: `Thông tin lưu trú `,
      icon: <HomeOutlined />,
      children: <InfoRooms />,
    },
  ];
  const [selectedLabel, setSelectedLabel] = useState('');
  const [shouldRestoreLabel, setShouldRestoreLabel] = useState(true);

  useEffect(() => {
    // Khôi phục selectedLabel từ localStorage khi shouldRestoreLabel được đặt là true
    if (shouldRestoreLabel) {
      const savedLabel = localStorage.getItem('selectedLabel');
      if (savedLabel) {
        setSelectedLabel(savedLabel);
      }
      setShouldRestoreLabel(false);
    }
  }, [shouldRestoreLabel]);

  useEffect(() => {
    // Lưu trữ selectedLabel vào localStorage và cập nhật nội dung của thẻ h1 khi selectedLabel thay đổi
    localStorage.setItem('selectedLabel', selectedLabel);
    document.title = selectedLabel;
  }, [selectedLabel]);

  useEffect(() => {
    // Cập nhật selectedLabel và activeKey khi tabKey thay đổi
    const selectedTab = items.find((item) => item.key === tabKey);
    if (selectedTab) {
      setSelectedLabel(selectedTab.label);
    }
  }, [tabKey, items]);

  const handleTabChange = (key) => {
    // Xử lý sự thay đổi tab và cập nhật selectedLabel
    const selectedTab = items.find((item) => item.key === key);
    if (selectedTab) {
      setSelectedLabel(selectedTab.label);
      navigate(`/profile/${key}`);
    }
  };

  return (
    <div className="wrapper-profile">
      <div className="container">
        <h1 className="title-page-user">{selectedLabel}</h1>
        <Divider />
        <Tabs
          tabPosition={'left'}
          items={items}
          onChange={handleTabChange}
          activeKey={
            tabKey || items.find((item) => item.label === selectedLabel)?.key
          }
        />
      </div>
    </div>
  );
};

export default ProfilePage;
