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

  // Helper function để chuyển đổi từ minPrice/maxPrice thành priceOption
  const getPriceOptionFromParams = (searchParams) => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (!minPrice && !maxPrice) return '';

    const min = parseInt(minPrice || 0);
    const max = parseInt(maxPrice || 50000000);

    // Khớp với các khoảng cố định
    if (min === 0 && max === 2000000) return '0-2000000';
    if (min === 2000000 && max === 4000000) return '2000000-4000000';
    if (min === 4000000 && max === 6000000) return '4000000-6000000';
    if (min === 6000000 && max === 10000000) return '6000000-10000000';
    if (min === 10000000 && max === 50000000) return '10000000-50000000';

    return '';
  };

  // Helper function để chuyển đổi từ minAcreage/maxAcreage thành acreageOption
  const getAcreageOptionFromParams = (searchParams) => {
    const minAcreage = searchParams.get('minAcreage');
    const maxAcreage = searchParams.get('maxAcreage');

    if (!minAcreage && !maxAcreage) return '';

    const min = parseInt(minAcreage || 0);
    const max = parseInt(maxAcreage || 100);

    // Khớp với các khoảng cố định
    if (min === 0 && max === 20) return '0-20';
    if (min === 20 && max === 30) return '20-30';
    if (min === 30 && max === 50) return '30-50';
    if (min === 50 && max === 100) return '50-100';

    return '';
  };

  // Khởi tạo filters từ URL params - sử dụng logic tương tự Home
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    priceOption: getPriceOptionFromParams(searchParams),
    acreageOption: getAcreageOptionFromParams(searchParams),
    views: searchParams.get('views') || '', // Thêm filter cho phòng HOT
  });

  // Cập nhật filters khi URL params thay đổi
  useEffect(() => {
    setFilters({
      type: searchParams.get('type') || '',
      priceOption: getPriceOptionFromParams(searchParams),
      acreageOption: getAcreageOptionFromParams(searchParams),
      views: searchParams.get('views') || '',
    });
    setCurrentPage(1); // Reset về trang 1 khi URL thay đổi
  }, [searchParams]);

  useEffect(() => {
    const fetchRooms = async (page = 1) => {
      // Lấy trực tiếp từ searchParams để đảm bảo đồng bộ
      const currentFilters = {
        type: searchParams.get('type') || '',
        views: searchParams.get('views') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minAcreage: searchParams.get('minAcreage') || '',
        maxAcreage: searchParams.get('maxAcreage') || '',
      };

      try {
        setLoading(true);

        const params = {
          page: page,
          limit: pageSize,
        };

        if (currentFilters.type) params.type = currentFilters.type;

        // Xử lý giá tiền từ URL params
        if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
        if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;

        // Xử lý diện tích từ URL params
        if (currentFilters.minAcreage)
          params.minAcreage = currentFilters.minAcreage;
        if (currentFilters.maxAcreage)
          params.maxAcreage = currentFilters.maxAcreage;

        console.log('Current URL filters:', currentFilters);
        console.log('API params:', params);

        // Nếu là filter phòng HOT, sử dụng API khác
        if (currentFilters.views === 'hot') {
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
        if (currentFilters.views === 'hot') {
          console.error('Lỗi tải phòng HOT:', error);
        } else {
          console.error('Lỗi tìm kiếm:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms(currentPage);
  }, [searchParams, currentPage, pageSize]);

  const handleFilterChange = (value, field) => {
    console.log(`Changing filter: ${field} = ${value}`);

    // Lấy TẤT CẢ filters hiện tại từ URL để không bị mất
    const currentFilters = {
      type: searchParams.get('type') || '',
      views: searchParams.get('views') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minAcreage: searchParams.get('minAcreage') || '',
      maxAcreage: searchParams.get('maxAcreage') || '',
    };

    // Xử lý các loại filter khác nhau
    if (field === 'type' || field === 'views') {
      currentFilters[field] = value;
    } else if (field === 'priceOption') {
      if (value) {
        const [min, max] = value.split('-');
        currentFilters.minPrice = min;
        currentFilters.maxPrice = max;
      } else {
        // Xóa filter giá nếu không chọn gì
        currentFilters.minPrice = '';
        currentFilters.maxPrice = '';
      }
    } else if (field === 'acreageOption') {
      if (value) {
        const [min, max] = value.split('-');
        currentFilters.minAcreage = min;
        currentFilters.maxAcreage = max;
      } else {
        // Xóa filter diện tích nếu không chọn gì
        currentFilters.minAcreage = '';
        currentFilters.maxAcreage = '';
      }
    }

    console.log('New filters:', currentFilters);

    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, val]) => {
      if (val && val !== '') newParams.append(key, val);
    });

    console.log('New URL params:', newParams.toString());
    setSearchParams(newParams);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
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
              <Select
                placeholder="Chọn khoảng giá"
                value={filters.priceOption || undefined}
                onChange={(value) => handleFilterChange(value, 'priceOption')}
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
              <Select
                placeholder="Chọn diện tích"
                value={filters.acreageOption || undefined}
                onChange={(value) => handleFilterChange(value, 'acreageOption')}
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
