import React from 'react';
import { Col, Divider, Row } from 'antd';
import logo from '../../Assets/logo_page.png';
import { Link } from 'react-router-dom';
import './footer.scss';
import FacebookIcon from '../Icons/FacebookIcon';
import TiktokIcon from './../Icons/TiktokIcon';

const Footer = () => {
  return (
    <div className="wrapper-footer">
      <div className="container">
        <Row>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 24 }}
            xl={{ span: 7 }}
          >
            <div className="footer-logo">
              <img src={logo} alt="logo" />
            </div>
            <p>Sự lựa chọn hoàn hảo cho Cửa hàng trực tuyến của bạn.</p>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 24 }}
            xl={{ span: 7 }}
          >
            <h3>Dịch vụ khách hàng</h3>
            <ul>
              <li>
                <Link to="/">Chính sách giao hàng</Link>
              </li>
              <li>
                <Link to="/">Chính sách bảo hành</Link>
              </li>
              <li>
                <Link to="/">Chính sách đổi trả</Link>
              </li>
              <li>
                <Link to="/">Hướng dẫn đổi trả</Link>
              </li>
              <li>
                <Link to="/">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/"> Chính sách bảo vệ dữ liệu cá nhân</Link>
              </li>
            </ul>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 24 }}
            xl={{ span: 5 }}
          >
            <h3>Về chúng tôi</h3>
            <ul>
              <li>
                <Link to="/">Thông tin mới nhất</Link>
              </li>
              <li>
                <Link to="/">Giải đáp</Link>
              </li>
              <li>
                <Link to="/contact">Liên hệ</Link>
              </li>
              <li>
                <Link to="/">Cửa hàng</Link>
              </li>
            </ul>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 24 }}
            xl={{ span: 5 }}
          >
            <h3>Liên kết với chúng tôi</h3>
            <ul>
              <li>
                <Link to="/">
                  <FacebookIcon />
                  Facebook
                </Link>
              </li>
              <li>
                <Link to="/">
                  <TiktokIcon />
                  Tiktok
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        <Divider />
      </div>
      <div className="license">
        <p>
          Copyright © 2024 TroMoi. Designed and Developed by Nguyen Xuan Son .
        </p>
      </div>
    </div>
  );
};

export default Footer;
