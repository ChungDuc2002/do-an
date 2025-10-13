import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import './style.scss';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Lấy parameters từ URL
        const searchParams = new URLSearchParams(location.search);
        const orderCode = searchParams.get('orderCode');

        console.log('PaymentSuccess: orderCode from URL:', orderCode);

        if (!orderCode) {
          throw new Error('Không có mã đơn hàng trong URL');
        }

        // Lấy thông tin từ localStorage (có thể không có đối với thanh toán lại)
        const orderId = localStorage.getItem('currentOrderId');
        const userId = localStorage.getItem('currentUserId');
        const rooms = JSON.parse(localStorage.getItem('currentRooms') || '[]');

        console.log('PaymentSuccess: localStorage data:', {
          orderId,
          userId,
          rooms,
        });

        // Gọi API để cập nhật trạng thái thanh toán
        // Chỉ cần orderCode là đủ, backend sẽ tìm đơn hàng theo orderCode
        const response = await axios.post(
          'http://localhost:5000/api/payos/payment-success',
          {
            orderCode,
            orderId: orderId || undefined, // Optional
            userId: userId || undefined, // Optional
            rooms: rooms.length > 0 ? rooms : undefined, // Optional
          }
        );

        console.log('PaymentSuccess API response:', response.data);

        if (response.data.success) {
          setSuccess(true);
          toast.success('Thanh toán thành công!');

          // Xóa thông tin tạm thời
          localStorage.removeItem('currentOrderId');
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('currentRooms');
        } else {
          throw new Error(response.data.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Payment success error:', error);
        toast.error('Có lỗi xảy ra: ' + error.message);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [location.search]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang xử lý thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <Result
        status={success ? 'success' : 'error'}
        title={success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
        subTitle={
          success
            ? 'Bạn đã đặt cọc phòng thành công. Chủ phòng sẽ liên hệ với bạn sớm nhất có thể.'
            : 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'
        }
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button key="profile" onClick={() => navigate('/profile/2')}>
            Xem phòng đã đặt
          </Button>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
