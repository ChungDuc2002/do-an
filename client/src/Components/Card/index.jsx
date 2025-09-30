import React from 'react';
import './style.scss';
const mockData = [
  {
    id: 1,
    image:
      'https://tromoi.com/uploads/static/phong_tro_da_nang/Ph%E1%BA%A1m%20V%E1%BA%A5n/pham_van_h5.jpg',
    title: 'Căn hộ 2PN Vinhomes Central Park',
    price: 15000000,
    category: 'Căn hộ',
    address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM',
  },
  {
    id: 2,
    image:
      'https://tromoi.com/uploads/static/phong_tro_da_nang/Ph%E1%BA%A1m%20V%E1%BA%A5n/pham_van_h5.jpg',
    title: 'Phòng trọ cao cấp Quận 7',
    price: 4500000,
    category: 'Phòng trọ',
    address: '123 Nguyễn Thị Thập, Quận 7, TP.HCM',
  },
  {
    id: 3,
    image:
      'https://tromoi.com/uploads/static/phong_tro_da_nang/Ph%E1%BA%A1m%20V%E1%BA%A5n/pham_van_h5.jpg',
    title: 'Nhà nguyên căn Gò Vấp',
    price: 12000000,
    category: 'Nhà nguyên căn',
    address: '45 Quang Trung, Gò Vấp, TP.HCM',
  },
];
const Card = ({ data }) => {
  return (
    <div className="room-card">
      <div className="card-image">
        <img src={data.image} alt={data.title} />
        <span className="category">{data.category}</span>
      </div>
      <div className="card-content">
        <h3 className="title">{data.title}</h3>
        <div className="price">
          <span>{data.price.toLocaleString()} đ/tháng</span>
        </div>
        <div className="address">
          <i className="fas fa-map-marker-alt"></i>
          <span>{data.address}</span>
        </div>
      </div>
    </div>
  );
};
const CardPage = () => {
  return (
    <div className="cards-container">
      {mockData.map((room) => (
        <Card key={room.id} data={room} />
      ))}
    </div>
  );
};

export default CardPage;
