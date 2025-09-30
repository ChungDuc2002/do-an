import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Input, Image } from 'antd';
import ErrorMessageIcon from './../../Components/Icons/ErrorMessageIcon';
import logo_school from '../../Assets/logo_school.png';
import './style.scss';

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    document.title = 'Đăng nhập';
  }, []);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const result = await axios.post('http://localhost:5000/login', values);
      const token = result.data.accessToken;
      if (result.status === 200) {
        if (result.data.isAdmin === true) {
          localStorage.setItem('authAdminSon', JSON.stringify(token));
          navigate('/admin');
        } else {
          localStorage.setItem('authSon', JSON.stringify(token));
          navigate('/');
        }
      }
    } catch (err) {
      setErrorMessage(
        'Thông tin đăng nhập không chính xác. Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.'
      );
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    }
  };

  return (
    <div className="wrapper-auth">
      <div className="header-login">
        <h1>phongtro123.com</h1>
      </div>
      <div className="wrapper-auth-form">
        <Form
          className="form"
          onFinish={onFinish}
          name="basic"
          autoComplete="off"
        >
          <div className="header-logo">
            <div className="logo">
              <Image preview={false} src={logo_school} />
            </div>
            <h2>Đăng nhập</h2>
          </div>
          {showErrorMessage && (
            <>
              <div className="error-message">
                <ErrorMessageIcon />
                <p>{errorMessage}</p>
              </div>
            </>
          )}
          <Form.Item name="email">
            <Input placeholder="Email" autoFocus />
          </Form.Item>
          <Form.Item name="password">
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Link to="/forgot-password">
            <p className="forgot-password">Bạn quên mật khẩu ?</p>
          </Link>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Đăng nhập
            </Button>
            <p>Bạn chưa có tài khoản ? </p>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-register"
              onClick={() => navigate('/register')}
            >
              Đăng ký ngay
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
