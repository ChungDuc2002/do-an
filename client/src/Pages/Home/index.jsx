import React, { useState, useEffect } from 'react';
import partnerImage from '../../Assets/banner_ohdidi.webp';
import app_mobile from '../../Assets/banner_app_user.jpg';
import Card from '../../Components/Card';
import HotCard from '../../Components/HotCard';
import axios from 'axios';
import { ArrowRightOutlined, FireFilled } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css';
import './style.scss';
import '../../Components/HotCard/style.scss';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [roomsWholeHouse, setRoomsWholeHouse] = useState([]);
  const [roomsApartment, setRoomsApartment] = useState([]);
  const [roomsMotelRoom, setMotelRoom] = useState([]);
  const [hotRooms, setHotRooms] = useState([]);

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
    priceRange: [0, 50000000], // Sử dụng array cho slider
    acreageRange: [0, 100], // Sử dụng array cho slider
    priceOption: '', // Để lưu option được chọn
    acreageOption: '', // Để lưu option được chọn
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý khi chọn khoảng giá từ dropdown
  const handlePriceOptionChange = (option) => {
    setFilters((prev) => ({
      ...prev,
      priceOption: option,
    }));

    // Chuyển đổi option thành range cho slider
    switch (option) {
      case '0-2':
        setFilters((prev) => ({ ...prev, priceRange: [0, 2000000] }));
        break;
      case '2-4':
        setFilters((prev) => ({ ...prev, priceRange: [2000000, 4000000] }));
        break;
      case '4-6':
        setFilters((prev) => ({ ...prev, priceRange: [4000000, 6000000] }));
        break;
      case '6-10':
        setFilters((prev) => ({ ...prev, priceRange: [6000000, 10000000] }));
        break;
      case '10+':
        setFilters((prev) => ({ ...prev, priceRange: [10000000, 50000000] }));
        break;
      default:
        break;
    }
  };

  // Xử lý khi chọn khoảng diện tích từ dropdown
  const handleAcreageOptionChange = (option) => {
    setFilters((prev) => ({
      ...prev,
      acreageOption: option,
    }));

    // Chuyển đổi option thành range cho slider
    switch (option) {
      case '0-20':
        setFilters((prev) => ({ ...prev, acreageRange: [0, 20] }));
        break;
      case '20-30':
        setFilters((prev) => ({ ...prev, acreageRange: [20, 30] }));
        break;
      case '30-50':
        setFilters((prev) => ({ ...prev, acreageRange: [30, 50] }));
        break;
      case '50+':
        setFilters((prev) => ({ ...prev, acreageRange: [50, 100] }));
        break;
      default:
        break;
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`;
    }
    return `${(price / 1000).toFixed(0)}k`;
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (filters.type) searchParams.append('type', filters.type);

    // Xử lý giá tiền - chỉ gửi khi có thay đổi từ default
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) {
      searchParams.append('minPrice', filters.priceRange[0]);
      searchParams.append('maxPrice', filters.priceRange[1]);
    }

    // Xử lý diện tích - chỉ gửi khi có thay đổi từ default
    if (filters.acreageRange[0] > 0 || filters.acreageRange[1] < 100) {
      searchParams.append('minAcreage', filters.acreageRange[0]);
      searchParams.append('maxAcreage', filters.acreageRange[1]);
    }

    console.log('Search params:', searchParams.toString());
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
            <div className="slider-container">
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="500000"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseInt(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  className="slider slider-min"
                />
                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="500000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="slider slider-max"
                />
                <div className="slider-track"></div>
                <div
                  className="slider-range"
                  style={{
                    left: `${(filters.priceRange[0] / 50000000) * 100}%`,
                    width: `${
                      ((filters.priceRange[1] - filters.priceRange[0]) /
                        50000000) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="range-values">
                <span className="min-value">
                  {formatPrice(filters.priceRange[0])}
                </span>
                <span className="separator">-</span>
                <span className="max-value">
                  {formatPrice(filters.priceRange[1])}
                </span>
              </div>
            </div>
            <div className="quick-options">
              <button
                className={`quick-btn ${
                  filters.priceOption === '0-2' ? 'active' : ''
                }`}
                onClick={() => handlePriceOptionChange('0-2')}
              >
                Dưới 2tr
              </button>
              <button
                className={`quick-btn ${
                  filters.priceOption === '2-4' ? 'active' : ''
                }`}
                onClick={() => handlePriceOptionChange('2-4')}
              >
                2-4tr
              </button>
              <button
                className={`quick-btn ${
                  filters.priceOption === '4-6' ? 'active' : ''
                }`}
                onClick={() => handlePriceOptionChange('4-6')}
              >
                4-6tr
              </button>
              <button
                className={`quick-btn ${
                  filters.priceOption === '6-10' ? 'active' : ''
                }`}
                onClick={() => handlePriceOptionChange('6-10')}
              >
                6-10tr
              </button>
              <button
                className={`quick-btn ${
                  filters.priceOption === '10+' ? 'active' : ''
                }`}
                onClick={() => handlePriceOptionChange('10+')}
              >
                Trên 10tr
              </button>
            </div>
          </div>

          {/* Diện tích */}
          <div className="filter-group">
            <div className="filter-label">
              <span className="label-text">Diện tích</span>
              <span className="label-icon">📐</span>
            </div>
            <div className="slider-container">
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.acreageRange[0]}
                  onChange={(e) =>
                    handleFilterChange('acreageRange', [
                      parseInt(e.target.value),
                      filters.acreageRange[1],
                    ])
                  }
                  className="slider slider-min"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.acreageRange[1]}
                  onChange={(e) =>
                    handleFilterChange('acreageRange', [
                      filters.acreageRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="slider slider-max"
                />
                <div className="slider-track"></div>
                <div
                  className="slider-range"
                  style={{
                    left: `${(filters.acreageRange[0] / 100) * 100}%`,
                    width: `${
                      ((filters.acreageRange[1] - filters.acreageRange[0]) /
                        100) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="range-values">
                <span className="min-value">{filters.acreageRange[0]}m²</span>
                <span className="separator">-</span>
                <span className="max-value">{filters.acreageRange[1]}m²</span>
              </div>
            </div>
            <div className="quick-options">
              <button
                className={`quick-btn ${
                  filters.acreageOption === '0-20' ? 'active' : ''
                }`}
                onClick={() => handleAcreageOptionChange('0-20')}
              >
                Dưới 20m²
              </button>
              <button
                className={`quick-btn ${
                  filters.acreageOption === '20-30' ? 'active' : ''
                }`}
                onClick={() => handleAcreageOptionChange('20-30')}
              >
                20-30m²
              </button>
              <button
                className={`quick-btn ${
                  filters.acreageOption === '30-50' ? 'active' : ''
                }`}
                onClick={() => handleAcreageOptionChange('30-50')}
              >
                30-50m²
              </button>
              <button
                className={`quick-btn ${
                  filters.acreageOption === '50+' ? 'active' : ''
                }`}
                onClick={() => handleAcreageOptionChange('50+')}
              >
                Trên 50m²
              </button>
            </div>
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
                  priceRange: [0, 50000000],
                  acreageRange: [0, 100],
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
            <Link to="/search?views=hot">Xem tất cả phòng HOT</Link>
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
