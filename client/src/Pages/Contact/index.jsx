import React, { useEffect, useState } from 'react';
import { PhoneOutlined, MailOutlined, SendOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import axios from 'axios';
import MapIcon from '../../Components/Icons/PhoneIcon';
import './style.scss';
import { toast } from 'react-hot-toast';
import ErrorMessageIcon from './../../Components/Icons/ErrorMessageIcon';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    document.title = 'Liên hệ - Chungduc_MO';
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    if (!name || !email || !phone || !title || !content) {
      e.preventDefault();
      setErrorMessage('Vui lòng điền đầy đủ thông tin cần thiết.');
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
      return;
    }

    const data = {
      name,
      email,
      phone,
      title,
      content,
    };
    try {
      await axios.post('http://localhost:5000/contacts/createContact', data);
      toast.success('Gửi thông tin thành công !');
    } catch (error) {
      setErrorMessage(
        'Vui lòng kiểm tra lại thông tin Email (Email phải chứa  @ và .) và Số điện thoại ( Số điện thoại phải từ 10-11 số).'
      );
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    }
  };
  return (
    <div className="wrapper-contact">
      <h1 className="title-page-user">Liên hệ</h1>
      <Divider />
      <div className="container form-contact">
        <div className="form-info">
          <h2>Thông tin liên hệ</h2>
          <p style={{ textTransform: 'initial' }}>
            Chúng tôi mong muốn lắng nghe ý kiến của quý khách . Vui lòng gửi
            mọi yêu cầu , thắc mắc theo thông tin bên cạnh, chúng tôi sẽ liên
            lạc với bạn sớm nhất .
          </p>
          <p>customer service</p>
          <span>
            <PhoneOutlined style={{ rotate: '90deg' }} />
            0962750965
          </span>
          <p>Email address</p>
          <span>
            <MailOutlined />
            nguyenchungduc2002@gmail.com
          </span>
          <p>Address</p>
          <span>
            <MapIcon />
            Hói Kiểng 10 - Hòa Quý - Ngũ Hành Sơn - Đà Nẵng
          </span>
        </div>
        <div className="form-input">
          <h2>Hỗ trợ</h2>
          {showErrorMessage && (
            <div className="error-message">
              <ErrorMessageIcon />
              <p>{errorMessage}</p>
            </div>
          )}
          <form action="" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tên của bạn"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Chủ đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              name=""
              id=""
              placeholder="Nội dung"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <button type="submit">
              <SendOutlined style={{ rotate: '-45deg' }} />
              Gửi thông tin{' '}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
