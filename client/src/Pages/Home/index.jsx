import React, { useState, useEffect } from 'react';
import partnerImage from '../../Assets/banner_ohdidi.webp';
import app_mobile from '../../Assets/banner_app_user.jpg';
import Card from '../../Components/Card';
import axios from 'axios';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';
import './style.scss';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [roomsWholeHouse, setRoomsWholeHouse] = useState([]);
  const [roomsApartment, setRoomsApartment] = useState([]);
  const [roomsMotelRoom, setMotelRoom] = useState([]);

  useEffect(() => {
    const getRoomWholeHouse = async () => {
      const result = await axios.get(
        'http://localhost:5000/room/getRoomsByType',
        {
          params: {
            type: 'nha-nguyen-can',
          },
        }
      );
      setRoomsWholeHouse(result.data);
    };
    getRoomWholeHouse();
  }, []);

  useEffect(() => {
    const getRoomApartment = async () => {
      const result = await axios.get(
        'http://localhost:5000/room/getRoomsByType',
        {
          params: {
            type: 'can-ho',
          },
        }
      );
      setRoomsApartment(result.data);
    };
    getRoomApartment();
  }, []);

  useEffect(() => {
    const getMotelRoom = async () => {
      const result = await axios.get(
        'http://localhost:5000/room/getRoomsByType',
        {
          params: {
            type: 'phong-tro',
          },
        }
      );
      setMotelRoom(result.data);
    };
    getMotelRoom();
  }, []);

  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: '',
    price: '',
    acreage: '',
  });

  const handleFilterChange = (e, field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (filters.type) searchParams.append('type', filters.type);
    if (filters.price) searchParams.append('price', filters.price);
    if (filters.acreage) searchParams.append('acreage', filters.acreage);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="wrapper-home">
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
      <div className=" container wrapper-home-filter">
        <h1 className="title">Bộ lọc</h1>
        <div className="filter-container">
          <div className="filter-item">
            <select
              defaultValue=""
              value={filters.type}
              onChange={(e) => handleFilterChange(e, 'type')}
            >
              <option value="" disabled>
                Loại phòng
              </option>
              <option value="phong-tro">Phòng trọ</option>
              <option value="nha-nguyen-can">Nhà nguyên căn</option>
              <option value="can-ho">Căn hộ</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              defaultValue=""
              value={filters.price}
              onChange={(e) => handleFilterChange(e, 'price')}
            >
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
            <select
              defaultValue=""
              value={filters.acreage}
              onChange={(e) => handleFilterChange(e, 'acreage')}
            >
              <option value="" disabled>
                Diện tích
              </option>
              <option value="0-20">Dưới 20m²</option>
              <option value="20-30">20 - 30m²</option>
              <option value="30-50">30 - 50m²</option>
              <option value="50+">Trên 50m²</option>
            </select>
          </div>
          <button className="search-button" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* nhà nguyên căn */}
      <div className="container wrapper-home-whole_house">
        <h1 className="title">Nhà nguyên căn</h1>
        <Swiper
          modules={[Pagination]}
          breakpoints={{
            375: {
              slidesPerView: 1,
              spaceBetween: 2,
            },
            425: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            575: {
              slidesPerView: 3,
              spaceBetween: 12,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 32,
            },
          }}
        >
          {roomsWholeHouse?.map((item, index) => (
            <SwiperSlide key={index}>
              <Card rooms={item} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="btn-all">
          <Link to="/rooms?type=nha-nguyen-can">Xem tất cả</Link>
          <ArrowRightOutlined />
        </button>
      </div>

      {/* đối tác */}
      <div className="container wrapper-home-partner">
        <img src={partnerImage} alt="" />
      </div>

      {/* căn hộ */}
      <div className="container wrapper-home-apartment">
        <h1 className="title">Căn hộ</h1>
        <Swiper
          modules={[Pagination]}
          breakpoints={{
            375: {
              slidesPerView: 1,
              spaceBetween: 2,
            },
            425: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            575: {
              slidesPerView: 3,
              spaceBetween: 12,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 32,
            },
          }}
        >
          {roomsApartment?.map((item, index) => (
            <SwiperSlide key={index}>
              <Card rooms={item} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="btn-all">
          <Link to="/rooms?type=can-ho">Xem tất cả</Link>
          <ArrowRightOutlined />
        </button>
      </div>
      {/* phòng trọ */}
      <div className="container wrapper-home-motel-room">
        <h1 className="title">Phòng trọ</h1>
        <Swiper
          modules={[Pagination]}
          breakpoints={{
            375: {
              slidesPerView: 1,
              spaceBetween: 2,
            },
            425: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            575: {
              slidesPerView: 3,
              spaceBetween: 12,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 32,
            },
          }}
        >
          {roomsMotelRoom?.map((item, index) => (
            <SwiperSlide key={index}>
              <Card rooms={item} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button className="btn-all">
          <Link to="/rooms?type=phong-tro">Xem tất cả</Link>
          <ArrowRightOutlined />
        </button>
      </div>
      <div className="container wrapper-home-app-mobile">
        <img src={app_mobile} alt="" />
      </div>
    </div>
  );
};

export default HomePage;
