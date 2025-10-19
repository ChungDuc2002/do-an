import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Typography,
  Space,
  Divider,
  Tag,
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './style.scss';

// Đăng ký các component Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const { Title: AntTitle, Text } = Typography;

const StatisticalPage = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({});
  const [roomsData, setRoomsData] = useState({});
  const [usersData, setUsersData] = useState({});
  const [revenueData, setRevenueData] = useState({});

  // Fetch dữ liệu từ API
  const fetchStatisticalData = async () => {
    try {
      setLoading(true);

      const [overviewRes, roomsRes, usersRes, revenueRes] = await Promise.all([
        axios.get('http://localhost:5000/statistical/overview'),
        axios.get('http://localhost:5000/statistical/rooms'),
        axios.get('http://localhost:5000/statistical/users'),
        axios.get('http://localhost:5000/statistical/revenue'),
      ]);

      setOverviewData(overviewRes.data.data);
      setRoomsData(roomsRes.data.data);
      setUsersData(usersRes.data.data);
      setRevenueData(revenueRes.data.data);
    } catch (error) {
      console.error('Error fetching statistical data:', error);
      toast.error('Lỗi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatisticalData();
  }, []);

  // Cấu hình biểu đồ phòng theo loại
  const roomTypeChartData = {
    labels: overviewData.roomsByType?.map((item) => item._id) || [],
    datasets: [
      {
        label: 'Số lượng phòng',
        data: overviewData.roomsByType?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Cấu hình biểu đồ trạng thái đặt phòng
  const bookingStatusChartData = {
    labels:
      overviewData.roomsByStatus?.map((item) => {
        const statusMap = {
          Pending: 'Chờ xử lý',
          Confirm: 'Đã xác nhận',
          Processing: 'Đang xử lý',
          Cancel: 'Đã hủy',
        };
        return statusMap[item._id] || item._id;
      }) || [],
    datasets: [
      {
        data: overviewData.roomsByStatus?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(220, 53, 69, 0.8)',
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Cấu hình biểu đồ đăng ký người dùng theo tháng
  const userRegistrationChartData = {
    labels:
      usersData.userRegistrationByMonth?.map(
        (item) => `${item._id.month}/${item._id.year}`
      ) || [],
    datasets: [
      {
        label: 'Số người đăng ký',
        data:
          usersData.userRegistrationByMonth?.map((item) => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  // Cấu hình biểu đồ doanh thu theo tháng
  const revenueChartData = {
    labels:
      revenueData.monthlyRevenue?.map(
        (item) => `${item._id.month}/${item._id.year}`
      ) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data:
          revenueData.monthlyRevenue?.map((item) => item.totalRevenue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Options cho biểu đồ
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Format số tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="statistical-loading">
        <Spin size="large" />
        <div>Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  return (
    <div className="statistical-page">
      <div className="statistical-header">
        <AntTitle level={2}>
          <BarChartOutlined /> Thống kê tổng quan
        </AntTitle>
        <Text type="secondary">
          Thống kê và báo cáo chi tiết về hệ thống quản lý phòng trọ
        </Text>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} className="overview-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ padding: '5px 10px' }}>
            <Statistic
              title="Tổng người dùng"
              value={overviewData.overview?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ padding: '5px 10px' }}>
            <Statistic
              title="Tổng số phòng"
              value={overviewData.overview?.totalRooms || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ padding: '5px 10px' }}>
            <Statistic
              title="Phòng đã thuê"
              value={overviewData.overview?.bookedRooms || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ padding: '5px 10px' }}>
            <Statistic
              title="Tổng doanh thu"
              value={formatPrice(revenueData.totalRevenue?.total || 0)}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Biểu đồ thống kê */}
      <Row gutter={[16, 16]} className="charts-section">
        {/* Biểu đồ phòng theo loại */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Phân loại phòng</span>
              </Space>
            }
          >
            <div className="chart-container">
              <Pie data={roomTypeChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Biểu đồ trạng thái đặt phòng */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Trạng thái đặt phòng</span>
              </Space>
            }
          >
            <div className="chart-container">
              <Doughnut data={bookingStatusChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Biểu đồ đăng ký người dùng */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Đăng ký người dùng theo tháng</span>
              </Space>
            }
          >
            <div className="chart-container">
              <Line data={userRegistrationChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>

        {/* Biểu đồ doanh thu */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Doanh thu theo tháng</span>
              </Space>
            }
          >
            <div className="chart-container">
              <Bar data={revenueChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Bảng thống kê chi tiết */}
      <Row gutter={[16, 16]} className="detail-tables">
        <Col xs={24} lg={12}>
          <Card title="Chi tiết phòng theo loại">
            <div className="room-type-details">
              {roomsData.detailedRoomsByType?.map((room, index) => (
                <div key={index} className="room-type-item">
                  <div className="room-type-header">
                    <Tag color="blue">{room._id}</Tag>
                    <Text strong>{room.count} phòng</Text>
                  </div>
                  <div className="room-type-info">
                    <Text type="secondary">
                      Giá TB: {formatPrice(room.avgPrice)} VNĐ | DT TB:{' '}
                      {room.avgAcreage?.toFixed(1)} m²
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Phòng theo quận/huyện">
            <div className="room-area-details">
              {roomsData.roomsByDistrict?.slice(0, 5).map((district, index) => (
                <div key={index} className="room-area-item">
                  <div className="room-area-header">
                    <Text strong>{district._id || 'Chưa xác định'}</Text>
                    <Tag color="green">{district.count} phòng</Tag>
                  </div>
                  <div className="room-area-info">
                    <Text type="secondary">
                      Giá TB: {formatPrice(district.avgPrice)} VNĐ
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticalPage;
