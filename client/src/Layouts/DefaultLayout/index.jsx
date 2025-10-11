import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderClient from '../../Components/HeaderClient';
import FooterClient from '../../Components/Footer';
import iconZalo from '../../Assets/zalo.png';
import './style.scss';

const DefaultLayout = () => {
  return (
    <>
      <HeaderClient />
      <Outlet />
      <img src={iconZalo} alt="zalo" className="zalo-icon" />
      <FooterClient />
    </>
  );
};

export default DefaultLayout;
