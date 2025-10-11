import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Select, Card, Spin, Empty, Pagination } from 'antd';
import CardComponent from '../../Components/Card';
import HotCard from '../../Components/HotCard';
import axios from 'axios';
import './style.scss';

const { Option } = Select;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 6; // 6 phòng mỗi trang

  // Khởi tạo filters từ URL params
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minAcreage: searchParams.get('minAcreage') || '',
    maxAcreage: searchParams.get('maxAcreage') || '',
    views: searchParams.get('views') || '', // Thêm filter cho phòng HOT
  });

  useEffect(() => {
    const fetchRooms = async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page: page,
          limit: pageSize,
        };

        if (filters.type) params.type = filters.type;

        // Xử lý giá tiền từ range sliders
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;

        // Xử lý diện tích từ range sliders
        if (filters.minAcreage) params.minAcreage = filters.minAcreage;
        if (filters.maxAcreage) params.maxAcreage = filters.maxAcreage;

        console.log('API params:', params);

        // Nếu là filter phòng HOT, sử dụng API khác
        if (filters.views === 'hot') {
          const response = await axios.get(
            'http://localhost:5000/room/getHotRooms',
            {
              params: { limit: 50 }, // Lấy nhiều để có thể phân trang
            }
          );

          const hotRoomsData = response.data?.data || [];
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedRooms = hotRoomsData.slice(startIndex, endIndex);

          setRooms(paginatedRooms || []);
          setTotal(hotRoomsData.length || 0);
        } else {
          const response = await axios.get(
            'http://localhost:5000/room/search',
            {
              params,
            }
          );

          setRooms(response.data?.data?.docs || []);
          setTotal(response.data?.data?.totalDocs || 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setRooms([]); // Đảm bảo luôn set array
        setTotal(0);

        // Hiển thị thông báo lỗi cho user
        if (filters.views === 'hot') {
          console.error('Lỗi tải phòng HOT:', error);
        } else {
          console.error('Lỗi tìm kiếm:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms(currentPage);
  }, [filters, currentPage, pageSize]);

  const handleFilterChange = (value, field) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter

    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newParams.append(key, val);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
              {filters.minPrice || filters.maxPrice ? (
                <div className="range-display">
                  <p>
                    Từ {parseInt(filters.minPrice || 0).toLocaleString('vi-VN')}{' '}
                    VNĐ
                  </p>
                  <p>
                    Đến{' '}
                    {parseInt(filters.maxPrice || 50000000).toLocaleString(
                      'vi-VN'
                    )}{' '}
                    VNĐ
                  </p>
                </div>
              ) : null}
              <Select
                placeholder="Chọn khoảng giá"
                onChange={(value) => {
                  if (value) {
                    const [min, max] = value.split('-');
                    handleFilterChange(min, 'minPrice');
                    handleFilterChange(max || '50000000', 'maxPrice');
                  } else {
                    handleFilterChange('', 'minPrice');
                    handleFilterChange('', 'maxPrice');
                  }
                }}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="0-2000000">Dưới 2 triệu</Option>
                <Option value="2000000-4000000">2 - 4 triệu</Option>
                <Option value="4000000-6000000">4 - 6 triệu</Option>
                <Option value="6000000-10000000">6 - 10 triệu</Option>
                <Option value="10000000-50000000">Trên 10 triệu</Option>
              </Select>
            </div>

            <div className="filter-item">
              <label>Diện tích</label>
              {filters.minAcreage || filters.maxAcreage ? (
                <div className="range-display">
                  <p>Từ {filters.minAcreage || 0}m²</p>
                  <p>Đến {filters.maxAcreage || 100}m²</p>
                </div>
              ) : null}
              <Select
                placeholder="Chọn diện tích"
                onChange={(value) => {
                  if (value) {
                    const [min, max] = value.split('-');
                    handleFilterChange(min, 'minAcreage');
                    handleFilterChange(max || '100', 'maxAcreage');
                  } else {
                    handleFilterChange('', 'minAcreage');
                    handleFilterChange('', 'maxAcreage');
                  }
                }}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="0-20">Dưới 20m²</Option>
                <Option value="20-30">20 - 30m²</Option>
                <Option value="30-50">30 - 50m²</Option>
                <Option value="50-100">Trên 50m²</Option>
              </Select>
            </div>
          </Card>
        </Col>

        {/* Results Section */}
        <Col span={18}>
          <div className="search-results">
            <div className="results-header">
              <h3>
                {filters.views === 'hot' ? 'Phòng HOT' : 'Kết quả tìm kiếm'} (
                {total} phòng)
              </h3>
            </div>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : rooms && rooms.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {rooms &&
                    rooms.map((room) => (
                      <Col span={8} key={room._id}>
                        {filters.views === 'hot' ? (
                          <HotCard rooms={room} />
                        ) : (
                          <CardComponent rooms={room} />
                        )}
                      </Col>
                    ))}
                </Row>{' '}
                {/* Pagination */}
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} của ${total} phòng`
                    }
                  />
                </div>
              </>
            ) : (
              <Empty description="Không tìm thấy kết quả phù hợp" />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
