import React, { useState } from 'react';
import { Image, Form, Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo_school from '../../Assets/logo_school.png';
import logo_web from '../../Assets/logo_page.png';
import './style.scss';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const result = await axios.post('http://localhost:5000/forgot-password', {
        email,
      });
      console.log(result);
      navigate('/login');
    } catch (error) {
      toast.error('Email Not Found , Try Again !');
    }
  };
  return (
    <div className="wrapper-forgot-password">
      {' '}
      <div className="header-login">
        <img src={logo_web} alt="" style={{ width: '250px' }} />
      </div>
      <div className="wrapper-forgot-password-form">
        <Form className="form" name="basic" autoComplete="off">
          <div className="header-logo">
            <div className="logo">
              <Image preview={false} src={logo_school} />
            </div>
            <h2>Quên mật khẩu</h2>
          </div>

          <Form.Item name="email">
            <Input
              placeholder="Email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <p>
            Vui lòng nhập địa chỉ email bạn đã sử dụng để tạo tài khoản và chúng
            tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
          </p>
          <div className="group-btn">
            <Button
              type="primary"
              htmlType="submit"
              className="btn-register"
              onClick={() => navigate('/login')}
            >
              Quay lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-register"
              onClick={() => {
                handleSubmit();
              }}
            >
              Lấy lại mật khẩu
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
