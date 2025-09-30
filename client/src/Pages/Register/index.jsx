import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Image } from 'antd';
import logo_school from '../../Assets/logo_school.png';
import './style.scss';

const RegisterPage = () => {
  useEffect(() => {
    document.title = 'Đăng ký';
  }, []);
  const navigate = useNavigate();

  //   const onFinish = async (values) => {
  //     try {
  //       const res = await axios.post('http://localhost:5000/register', values);
  //       if (res.status === 200) {
  //         const token = res.data;
  //         localStorage.setItem('auth', JSON.stringify(token));
  //         navigate('/login');
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  return (
    <div className="wrapper-auth">
      <div className="header-login">
        <h1>Phongtro123.com</h1>
      </div>
      <div className="wrapper-auth-form">
        <Form
          className="form"
          //</div> onFinish={onFinish}
        >
          <div className="header-logo">
            <div className="logo">
              <Image preview={false} src={logo_school} />
            </div>
            <h2>Đăng ký</h2>
          </div>
          <Form.Item
            name="fullName"
            rules={[
              {
                required: true,
                message: 'Please confirm your name !',
              },
            ]}
          >
            <Input placeholder="Full Name" autoFocus />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please confirm your email !',
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('The new password that you entered do not match!')
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Đăng ký
            </Button>
            <p>Bạn đã có tài khoản ? </p>
            <Button
              type="primary"
              className="btn-register"
              onClick={() => navigate('/login')}
            >
              Đăng nhập ngay
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
