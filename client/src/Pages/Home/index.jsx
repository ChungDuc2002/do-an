import React from 'react';
import partnerImage from '../../Assets/banner_ohdidi.webp';
import './style.scss';

const HomePage = () => {
  return (
    <div className="wrapper-home">
      <div className=" container wrapper-home-filter">
        <div className="filter-container">
          <div className="filter-item">
            <select defaultValue="">
              <option value="" disabled>
                Thành phố
              </option>
              <option value="ha-noi">Hà Nội</option>
              <option value="ho-chi-minh">Hồ Chí Minh</option>
              <option value="da-nang">Đà Nẵng</option>
              <option value="can-tho">Cần Thơ</option>
              <option value="hai-phong">Hải Phòng</option>
            </select>
          </div>
          <div className="filter-item">
            <select defaultValue="">
              <option value="" disabled>
                Loại phòng
              </option>
              <option value="phong-tro">Phòng trọ</option>
              <option value="nha-nguyen-can">Nhà nguyên căn</option>
              <option value="can-ho">Căn hộ</option>
            </select>
          </div>
          <div className="filter-item">
            <select defaultValue="">
              <option value="" disabled>
                Mức giá
              </option>
              <option value="0-2">Dưới 2 triệu</option>
              <option value="2-4">2 - 4 triệu</option>
              <option value="4-6">4 - 6 triệu</option>
              <option value="6-10">6 - 10 triệu</option>
              <option value="10+">Trên 10 triệu</option>
            </select>
          </div>
          <div className="filter-item">
            <select defaultValue="">
              <option value="" disabled>
                Diện tích
              </option>
              <option value="0-20">Dưới 20m²</option>
              <option value="20-30">20 - 30m²</option>
              <option value="30-50">30 - 50m²</option>
              <option value="50+">Trên 50m²</option>
            </select>
          </div>
          <button className="search-button">Tìm kiếm</button>
        </div>
      </div>
      <div className="wrapper-home-banner">
        <div className="image">
          <img
            src="https://tromoi.com/frontend/home/images/banner_default.jpg"
            alt="Banner"
          />
          <div className="info">
            <h2>Tìm nhanh, kiếm dễ</h2>
            <h2>Trọ Mới toàn quốc</h2>
            <p>
              Trang thông tin và cho thuê phòng trọ nhanh chóng, hiệu quả với
              hơn 500 tin đăng mới và 30.000 lượt xem mỗi ngày
            </p>
          </div>
        </div>
      </div>
      {/* nhà nguyên căn */}
      <div className="container wrapper-home-whole_house">
        <h1 className="title">Nhà nguyên căn</h1>
      </div>
      {/* căn hộ */}
      <div className="wrapper-home-apartment"></div>
      {/* phòng trọ */}
      <div className="wrapper-home-room"></div>
      {/* đối tác */}
      <div className="container wrapper-home-partner">
        <img src={partnerImage} alt="" />
      </div>
    </div>
  );
};

export default HomePage;
