import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import moment from 'moment';
import { debounce } from 'lodash';
import './style.scss';

const ManagerUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    document.title = 'Quản lý người dùng';
    const fetchUser = async () => {
      const token = localStorage.getItem('authAdminSon');
      const tokenParse = JSON.parse(token);
      try {
        const res = await axios.get('http://localhost:5000/getAllUsers', {
          headers: {
            token: `Bearer ${tokenParse}`,
          },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (filterRole === 'all') {
      setFilteredUsers(users);
    } else {
      const isAdmin = filterRole === 'admin';
      setFilteredUsers(users.filter((user) => user.isAdmin === isAdmin));
    }
  }, [filterRole, users]);

  const columns = [
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (text, record) => (
        <img
          src={
            record.avatar
              ? record.avatar
              : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrHT9KQ3vag-Gdd9sjA7pi6zl2f_ho4Gh7Vg&s'
          }
          alt=""
          style={{ width: '50px', height: '50px' }}
        />
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },

    {
      title: 'Created At',
      key: 'createdAt',
      render: (text, record) => (
        <span>{moment(record.createdAt).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Updated At',
      key: 'createdAt',
      render: (text, record) => (
        <span>{moment(record.updatedAt).format('DD/MM/YYYY - h:mm:ss a')}</span>
      ),
    },
    {
      title: 'Role',
      key: 'isAdmin',
      render: (text, record) => (
        <span
          className={record.isAdmin ? 'role_render-admin' : 'role_render-user'}
        >
          {record.isAdmin ? 'Admin' : 'User'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div>
          <Button
            style={{ marginRight: '5px' }}
            onClick={() => {
              handleEdit(record);
            }}
            className="btn-action"
          >
            <EditOutlined />
          </Button>
          <Button
            onClick={() => {
              handleDelete(record);
            }}
            className="btn-action"
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = async (record) => {
    if (
      window.confirm(`Are you sure you want to detete user ${record.fullName}`)
    ) {
      try {
        const result = await axios.delete(
          `http://localhost:5000/deleteUser/${record._id}`
        );
        if (result.status === 200) {
          const newUser = users.filter((user) => user._id !== record._id);
          setUsers(newUser);
          toast.success('Delete user success');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const [open, setOpen] = React.useState(false);
  const [modalAddNewUser, setModalAddNewUser] = React.useState(false);
  const [item, setItem] = React.useState(false);

  const handleEdit = (record) => {
    setOpen(true);
    setItem(record);
  };
  const handleCancel = () => {
    setOpen(false);
    setModalAddNewUser(false);
  };

  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState('');

  const handleSearch = useCallback(
    debounce(async (value) => {
      setSearch(value);
      if (value.trim() === '') {
        return setSearchResult([]);
      }
      try {
        const response = await axios.get('http://localhost:5000/searchUser', {
          params: { fullName: value },
        });
        setSearchResult(response.data);
      } catch (error) {
        console.log(error);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearch(value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  return (
    <div className="wrapper-manager-user">
      <div className="group-btn">
        <input
          autoFocus
          className="search-user"
          type="text"
          placeholder="Tìm kiếm tại đây . . ."
          value={search}
          onChange={handleInputChange}
          onBlur={() => handleSearch(search)}
        />
        <div className="action">
          <select name="" id="" onChange={handleFilterChange}>
            <option value="all">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <Button
            className="btn-add-user"
            onClick={() => {
              setModalAddNewUser(!modalAddNewUser);
            }}
          >
            Thêm mới người dùng
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={searchResult.length > 0 ? searchResult : filteredUsers}
        pagination={{ pageSize: 7 }}
      />
      <Modal
        open={open}
        onCancel={handleCancel}
        closeIcon={false}
        footer={false}
      >
        {item && <ModalEditUser id={item} onCancel={handleCancel} />}
      </Modal>
      <Modal
        open={modalAddNewUser}
        onCancel={handleCancel}
        closeIcon={false}
        footer={false}
      >
        <AddNewUser onCancel={handleCancel} />
      </Modal>
    </div>
  );
};

function ModalEditUser({ id, onCancel }) {
  //* LOGIC UPDATE USER---------------

  const [userUpdate, setUserUpdate] = useState({});

  useEffect(() => {
    const fetchUserById = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/getUser/${id._id}`);
        setUserUpdate(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserById();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const result = await axios.put(
        `http://localhost:5000/updateUser/${id._id}`,
        userUpdate
      );
      if (result.status === 200) {
        toast.success('Update user success');
      }
    } catch (error) {
      toast.error('Update user fail !');
    }
  };

  const handleCancel = () => {
    onCancel();
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1 className="title-admin">Update User</h1>
        <div className="row">
          <label htmlFor="">Full Name </label>
          <input
            type="text"
            autoFocus
            value={userUpdate?.fullName}
            onChange={(e) =>
              setUserUpdate({ ...userUpdate, fullName: e.target.value })
            }
          />
        </div>
        <div className="row">
          <label htmlFor="">Email </label>
          <input
            type="email"
            placeholder=""
            value={userUpdate?.email}
            onChange={(e) =>
              setUserUpdate({ ...userUpdate, email: e.target.value })
            }
          />
        </div>
        <div className="row">
          <label htmlFor="">Phone </label>
          <input
            type="text"
            placeholder=""
            value={userUpdate?.phone}
            onChange={(e) =>
              setUserUpdate({ ...userUpdate, phone: e.target.value })
            }
          />
        </div>
        <div className="row">
          <label htmlFor="">Role </label>
          <select
            name=""
            id=""
            value={userUpdate?.isAdmin}
            onChange={(e) =>
              setUserUpdate({ ...userUpdate, isAdmin: e.target.value })
            }
          >
            <option value="false">User</option>
            <option value="true">Admin</option>
          </select>
        </div>
        <div className="group-btn">
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </>
  );
}
function AddNewUser({ onCancel }) {
  //* LOGIC ADD NEW USER---------------
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async () => {
    try {
      const result = await axios.post('http://localhost:5000/createUser', {
        fullName,
        email,
        phone,
        password,
        isAdmin,
      });
      if (result.status === 200) {
        toast.success('Add new user success');
      }
    } catch (error) {
      toast.error('Add new user fail !');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="wrapper-add-user">
      <form onSubmit={handleSubmit}>
        <h1 className="title-admin">Add New User</h1>
        <div className="row">
          <label htmlFor="">Full Name </label>
          <input
            type="text"
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="row">
          <label htmlFor="">Email </label>
          <input
            type="email"
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="row">
          <label htmlFor="">Phone </label>
          <input
            type="text"
            placeholder=""
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="row">
          <label htmlFor="">Password </label>
          <input
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="row">
          <label htmlFor="">Role </label>
          <select
            name=""
            id=""
            value={isAdmin}
            onChange={(e) => setIsAdmin(e.target.value)}
          >
            <option value="false">User</option>
            <option value="true">Admin</option>
          </select>
        </div>
        <div className="group-btn">
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

export default ManagerUsers;
