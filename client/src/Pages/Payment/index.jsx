import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, message, Card, Image, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const PaymentPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/room/getRoomById/${id}`
        );
        setRoom(response.data);
        console.log('cc', response.data);
      } catch (error) {
        message.error('Lỗi khi tải thông tin phòng');
      }
    };
    fetchRoom();
  }, [id]);

  useEffect(() => {
    const getIdUser = async () => {
      const token = JSON.parse(localStorage.getItem('authSon'));
      try {
        const result = await axios.get('http://localhost:5000/info', {
          headers: {
            token: `Bearer ${token}`,
          },
        });
        if (result.status === 200) {
          setUserInfo(result.data);
          setUserId(result.data._id);
          setUserEmail(result.data.email);
          setUserPhone(result.data.phone);
          console.log(result.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getIdUser();
  }, []);

  const handleNavigateInfo = () => {
    navigate('/profile/1');
  };

  const handlePayment = async () => {
    const depositAmount = Math.ceil(room.price * 0.3);
    try {
      const roomData = {
        roomId: room._id,
        price: depositAmount,
        title: room.title,
      };

      const response = await axios.post(
        'http://localhost:5000/api/payos/create-payment',
        {
          amount: depositAmount,
          description: `Đặt cọc ${room.title}`, // Rút ngắn description
          userId,
          userInfo,
          rooms: roomData,
        }
      );

      if (response.data.checkoutUrl && response.data.orderId) {
        // Lưu thông tin vào localStorage để sử dụng trong PaymentSuccess
        localStorage.setItem('currentOrderId', response.data.orderId);
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('currentRooms', JSON.stringify([roomData]));

        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Có lỗi xảy ra: ' + error.message);
    }
  };

  if (!room) return null;

  return (
    <div className="container wrapper-payment">
      <div className="payment-content">
        <div className="room-info">
          <Card title="Thông tin phòng">
            <Image
              src={`http://localhost:5000${room.images[0]}`}
              alt="Ảnh chính"
              className="main-image"
            />
            <div className="group">
              <h2>{room.title}</h2>
              <p>
                Địa chỉ: {room.address.street}, {room.address.ward}
              </p>
              <p>
                Loại phòng:{' '}
                <span
                  style={{
                    padding: '2px 5px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #f5f5f5',
                    borderRadius: '5px',
                  }}
                >
                  {room.type === 'nha-nguyen-can'
                    ? 'Nhà nguyên căn'
                    : room.type === 'phong-tro'
                    ? 'Phòng trọ'
                    : room.type === 'can-ho'
                    ? 'Căn hộ'
                    : room.type}
                </span>
              </p>
              <p>
                Tiện ích :{' '}
                {room?.amenities.map((item, index) => (
                  <Tag key={index} color="cyan" style={{ fontSize: '16px' }}>
                    {item === 'wifi'
                      ? 'Wifi'
                      : item === 'air_conditioner'
                      ? 'Điều hòa'
                      : item === 'water_heater'
                      ? 'Nóng lạnh'
                      : item === 'refrigerator'
                      ? 'Tủ lạnh'
                      : item === 'washing_machine'
                      ? 'Máy giặt'
                      : item === 'parking'
                      ? 'Chỗ để xe'
                      : item === 'elevator'
                      ? 'Thang máy'
                      : item === 'drying_area'
                      ? 'Chỗ phơi đồ'
                      : item === 'yard'
                      ? 'Sân bãi'
                      : item}
                  </Tag>
                ))}
              </p>
            </div>
          </Card>
        </div>
        <div className="customer-info">
          <Card
            title="Thông tin người đặt cọc"
            style={{ height: '200px !important' }}
          >
            <p>Họ và tên : {userInfo.fullName} </p>
            <p>Email : {userEmail}</p>
            <p>Phone : {userPhone}</p>
            <p>
              Giới tính :{' '}
              {userInfo.gender === 'nam'
                ? 'Nam'
                : userInfo.gender === 'nu'
                ? 'Nữ'
                : userInfo.gender}
            </p>
            <Divider />
            <button onClick={handleNavigateInfo}>Thay đổi thông tin</button>
          </Card>
          <Card title="Thanh toán phòng ">
            <p>
              Giá thuê:{' '}
              <span
                style={{
                  backgroundColor: 'orange',
                  padding: '3px 5px',
                  borderRadius: '5px',
                }}
              >
                {room.price?.toLocaleString()} VNĐ/tháng
              </span>{' '}
            </p>
            <p>
              Tiền cọc (30%):{' '}
              <span
                style={{
                  backgroundColor: 'orange',
                  padding: '3px 5px',
                  borderRadius: '5px',
                }}
              >
                {Math.ceil(room.price * 0.3).toLocaleString()} VNĐ
              </span>
            </p>
            <p>
              Lưu ý : Khách hàng sẽ được yêu cầu đặt cọc ít nhất 30% giá trị
              phòng
            </p>
            <button onClick={handlePayment}>Thanh toán</button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
