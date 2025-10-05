import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Select, Card, Spin, Empty } from 'antd';
import CardComponent from '../../Components/Card';
import axios from 'axios';
import './style.scss';

const { Option } = Select;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    price: searchParams.get('price') || '',
    acreage: searchParams.get('acreage') || '',
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filters.type) params.type = filters.type;

      if (filters.price) {
        const [min, max] = filters.price.split('-');
        params.minPrice = min;
        params.maxPrice = max;
      }

      if (filters.acreage) {
        const [min, max] = filters.acreage.split('-');
        params.minAcreage = min;
        params.maxAcreage = max;
      }

      const response = await axios.get('http://localhost:5000/room/search', {
        params,
      });
      setRooms(response.data.data.docs);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const handleFilterChange = (value, field) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // Update URL params
    setSearchParams(newFilters);
  };

  return (
    <div className="container search-page">
      <Row gutter={24}>
        {/* Filter Section */}
        <Col span={6}>
          <Card title="Bộ lọc tìm kiếm" className="filter-card">
            <div className="filter-item">
              <label>Loại phòng</label>
              <Select
                value={filters.type}
                onChange={(value) => handleFilterChange(value, 'type')}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả</Option>
                <Option value="phong-tro">Phòng trọ</Option>
                <Option value="nha-nguyen-can">Nhà nguyên căn</Option>
                <Option value="can-ho">Căn hộ</Option>
              </Select>
            </div>

            <div className="filter-item">
              <label>Mức giá</label>
              <Select
                value={filters.price}
                onChange={(value) => handleFilterChange(value, 'price')}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả</Option>
                <Option value="0-2000000">Dưới 2 triệu</Option>
                <Option value="2000000-4000000">2 - 4 triệu</Option>
                <Option value="4000000-6000000">4 - 6 triệu</Option>
                <Option value="6000000-10000000">6 - 10 triệu</Option>
                <Option value="10000000">Trên 10 triệu</Option>
              </Select>
            </div>

            <div className="filter-item">
              <label>Diện tích</label>
              <Select
                value={filters.acreage}
                onChange={(value) => handleFilterChange(value, 'acreage')}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả</Option>
                <Option value="0-20">Dưới 20m²</Option>
                <Option value="20-30">20 - 30m²</Option>
                <Option value="30-50">30 - 50m²</Option>
                <Option value="50">Trên 50m²</Option>
              </Select>
            </div>
          </Card>
        </Col>

        {/* Results Section */}
        <Col span={18}>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : rooms.length > 0 ? (
            <Row gutter={[16, 16]}>
              {rooms.map((room) => (
                <Col span={8} key={room._id}>
                  <CardComponent rooms={room} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="Không tìm thấy kết quả phù hợp" />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
