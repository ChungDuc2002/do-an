import React, { useState, useEffect } from 'react';
import partnerImage from '../../Assets/banner_ohdidi.webp';
import app_mobile from '../../Assets/banner_app_user.jpg';
import Card from '../../Components/Card';
import HotCard from '../../Components/HotCard';
import axios from 'axios';
import { ArrowRightOutlined, FireFilled } from '@ant-design/icons';
import { Select } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';
import './style.scss';
import '../../Components/HotCard/style.scss';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const HomePage = () => {
  const [roomsWholeHouse, setRoomsWholeHouse] = useState([]);
  const [roomsApartment, setRoomsApartment] = useState([]);
  const [roomsMotelRoom, setMotelRoom] = useState([]);
  const [hotRooms, setHotRooms] = useState([]);
  const [banner, setBanner] = useState([]);

  useEffect(() => {
    const getBanner = async () => {
      const result = await axios.get('http://localhost:5000/slides/getSlides');
      console.log('banner', result.data);

      setBanner(result.data);
    };
    getBanner();
  }, []);

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

  // Lấy danh sách phòng HOT
  useEffect(() => {
    const getHotRooms = async () => {
      try {
        const result = await axios.get(
          'http://localhost:5000/room/getHotRooms',
          {
            params: {
              limit: 8, // Lấy tối đa 8 phòng HOT
            },
          }
        );
        setHotRooms(result.data.data);
      } catch (error) {
        console.error('Error fetching hot rooms:', error);
        setHotRooms([]);
      }
    };
    getHotRooms();
  }, []);

  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: '',
    priceOption: '', // Chỉ sử dụng select dropdown
    acreageOption: '', // Chỉ sử dụng select dropdown
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (filters.type) searchParams.append('type', filters.type);

    // Xử lý giá tiền từ priceOption
    if (filters.priceOption) {
      const [min, max] = filters.priceOption.split('-');
      searchParams.append('minPrice', min);
      searchParams.append('maxPrice', max);
    }

    // Xử lý diện tích từ acreageOption
    if (filters.acreageOption) {
      const [min, max] = filters.acreageOption.split('-');
      searchParams.append('minAcreage', min);
      searchParams.append('maxAcreage', max);
    }

    console.log('Search params:', searchParams.toString());
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="wrapper-home">
      <div className="wrapper-home-banner">
        {banner &&
          banner.length > 0 &&
          banner.map((item, index) => (
            <div className="image" key={index}>
              <img
                src={require(`../../../../server/uploads/${item.image}`)}
                alt={`Banner ${index + 1}`}
              />
              <div className="info">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
      </div>
      <div className="container wrapper-home-filter">
        <div className="filter-header">
          <h1 className="title">Tìm kiếm phòng trọ</h1>
          <p className="subtitle">
            Lọc theo tiêu chí để tìm phòng phù hợp nhất
          </p>
        </div>

        <div className="filter-container">
          {/* Loại phòng */}
          <div className="filter-group">
            <div className="filter-label">
              <span className="label-text">Loại phòng</span>
              <span className="label-icon">🏠</span>
            </div>
            <div className="filter-options">
              <div className="radio-group">
                <label
                  className={`radio-option ${
                    filters.type === '' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value=""
                    checked={filters.type === ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  />
                  <span className="radio-text">Tất cả</span>
                </label>
                <label
                  className={`radio-option ${
                    filters.type === 'phong-tro' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="phong-tro"
                    checked={filters.type === 'phong-tro'}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  />
                  <span className="radio-text">Phòng trọ</span>
                </label>
                <label
                  className={`radio-option ${
                    filters.type === 'nha-nguyen-can' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="nha-nguyen-can"
                    checked={filters.type === 'nha-nguyen-can'}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  />
                  <span className="radio-text">Nhà nguyên căn</span>
                </label>
                <label
                  className={`radio-option ${
                    filters.type === 'can-ho' ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value="can-ho"
                    checked={filters.type === 'can-ho'}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  />
                  <span className="radio-text">Căn hộ</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mức giá */}
          <div className="filter-group">
            <div className="filter-label">
              <span className="label-text">Mức giá</span>
              <span className="label-icon">💰</span>
            </div>
            <Select
              placeholder="Chọn khoảng giá"
              value={filters.priceOption}
              onChange={(value) => handleFilterChange('priceOption', value)}
              style={{ width: '100%', marginTop: '10px' }}
              allowClear
            >
              <Option value="0-2000000">Dưới 2 triệu</Option>
              <Option value="2000000-4000000">2 - 4 triệu</Option>
              <Option value="4000000-6000000">4 - 6 triệu</Option>
              <Option value="6000000-10000000">6 - 10 triệu</Option>
              <Option value="10000000-50000000">Trên 10 triệu</Option>
            </Select>
          </div>

          {/* Diện tích */}
          <div className="filter-group">
            <div className="filter-label">
              <span className="label-text">Diện tích</span>
              <span className="label-icon">📐</span>
            </div>
            <Select
              placeholder="Chọn diện tích"
              value={filters.acreageOption}
              onChange={(value) => handleFilterChange('acreageOption', value)}
              style={{ width: '100%', marginTop: '10px' }}
              allowClear
            >
              <Option value="0-20">Dưới 20m²</Option>
              <Option value="20-30">20 - 30m²</Option>
              <Option value="30-50">30 - 50m²</Option>
              <Option value="50-100">Trên 50m²</Option>
            </Select>
          </div>

          {/* Nút tìm kiếm */}
          <div className="search-section">
            <button className="search-button" onClick={handleSearch}>
              <span className="search-icon">🔍</span>
              <span className="search-text">Tìm kiếm ngay</span>
            </button>
            <button
              className="reset-button"
              onClick={() =>
                setFilters({
                  type: '',
                  priceOption: '',
                  acreageOption: '',
                })
              }
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Phòng HOT */}
      {hotRooms.length > 0 && (
        <div className="container wrapper-home-hot-rooms">
          <h1 className="title">
            <FireFilled className="fire-icon" />
            Phòng HOT
          </h1>
          <p className="hot-subtitle">Những phòng được quan tâm nhiều nhất</p>
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
            {hotRooms.map((item, index) => (
              <SwiperSlide key={index}>
                <HotCard rooms={item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <button className="btn-all">
            <Link to="/rooms?type=hot">Xem tất cả phòng HOT</Link>
            <ArrowRightOutlined />
          </button>
        </div>
      )}

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
