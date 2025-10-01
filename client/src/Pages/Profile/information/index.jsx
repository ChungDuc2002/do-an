import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './style.scss';

const InformationProfile = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUserById = async () => {
      const token = JSON.parse(localStorage.getItem('authSon'));
      const result = await axios.get('http://localhost:5000/info', {
        headers: {
          token: `Bearer ${token}`,
        },
      });
      setUser(result.data);
    };
    getUserById();
  }, []);

  const handleUpdateUser = async () => {
    try {
      const result = await axios.put(
        `http://localhost:5000/updateUser/${user._id}`,
        user
      );
      console.log(result);
      toast.success('Updated information success !');
    } catch (error) {
      toast.error('Updated information fail !');
    }
  };
  return (
    <div className="wrapper-my-profile">
      <div className="title">
        <h1>Thông tin cá nhân</h1>
        <p>
          Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng
          ra sao.
        </p>
      </div>
      <form action="" onSubmit={handleUpdateUser}>
        <label htmlFor="">Họ tên :</label>
        <input
          type="text"
          value={user?.fullName}
          onChange={(e) => setUser({ ...user, fullName: e.target.value })}
        />
        <label htmlFor="">Email : </label>
        <input
          type="text"
          disabled
          value={user?.email}
          style={{ background: '#f5f5f5' }}
        />

        <label htmlFor="">Số điện thoại :</label>
        <input
          type="text"
          value={user?.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />
        <label htmlFor="">Giới tính :</label>
        <select
          name=""
          id=""
          value={user?.gender}
          onChange={(e) => setUser({ ...user, gender: e.target.value })}
        >
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
        </select>
        <button type="button">Hủy</button>
        <button type="submit">Lưu</button>
      </form>
    </div>
  );
};

export default InformationProfile;
