import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import './style.scss';

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa thông tin tạm thời khi hủy thanh toán
    localStorage.removeItem('currentOrderId');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentRooms');
  }, []);

  return (
    <div className="payment-success">
      <Result
        status="warning"
        title="Thanh toán đã bị hủy!"
        subTitle="Bạn đã hủy giao dịch thanh toán. Bạn có thể thử lại bất cứ lúc nào."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Quay lại
          </Button>,
        ]}
      />
    </div>
  );
};

export default PaymentCancel;
