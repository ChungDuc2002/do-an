import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderClient from '../../Components/HeaderClient';
import FooterClient from '../../Components/Footer';
import ChatBox from '../../Components/ChatBox';
import './style.scss';

const DefaultLayout = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleChatToggle = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleChatClose = () => {
    setIsChatVisible(false);
  };

  return (
    <>
      <HeaderClient />
      <Outlet />

      <div className="chat-icon-container" onClick={handleChatToggle}>
        <div className={`chat-icon ${isChatVisible ? 'active' : ''}`}>
          <div className="chat-bubble">
            <div className="chat-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="chat-pulse"></div>
        </div>
      </div>

      <ChatBox isVisible={isChatVisible} onClose={handleChatClose} />

      <FooterClient />
    </>
  );
};

export default DefaultLayout;
