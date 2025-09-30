import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderClient from '../../Components/HeaderClient';
import FooterClient from '../../Components/Footer';

const DefaultLayout = () => {
  return (
    <>
      <HeaderClient />
      <Outlet />
      <FooterClient />
    </>
  );
};

export default DefaultLayout;
