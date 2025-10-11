import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Pagination, Radio, Table, Tooltip } from 'antd';
import { CopyOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import './style.scss';
import { toast } from 'react-hot-toast';

const ManagerContact = () => {
  const [open, setOpen] = useState(false);
  const [item, setItem] = React.useState(false);

  const [apiContact, setApiContact] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    document.title = 'Quản lý liên hệ';
    const getAllBanner = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/contacts/getContacts'
        );
        setApiContact(res.data);
        console.log(apiContact);
      } catch (error) {
        console.log(error);
      }
    };
    getAllBanner();
  }, []);

  //* LOGIC PAGINATION---------------
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = apiContact.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleEditContact = (record) => {
    setItem(record);
    setOpen(true);
  };
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      render: (text, record) => (
        <span>
          {record.status === 'pending' ? (
            <span className="pending-style">{record.status}</span>
          ) : (
            <span className="replied-style">{record.status}</span>
          )}
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
            className="btn-action"
            onClick={() => {
              handleEditContact(record);
            }}
          >
            <EyeOutlined />
          </Button>
          <Button
            className="btn-action"
            onClick={() => {
              handleDeleteContact(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteContact = async (record) => {
    if (
      window.confirm(`Are you sure you want to delete ${record.name} contact?`)
    ) {
      try {
        const result = await axios.delete(
          `http://localhost:5000/contacts/deleteContact/${record._id}`
        );
        if (result.status === 200) {
          const newContact = apiContact.filter(
            (item) => item._id !== record._id
          );
          setApiContact(newContact);
          console.log('Delete contact success');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div className="wrapper-manager-contact">
      <Table columns={columns} dataSource={currentUsers} pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={usersPerPage}
        total={apiContact.length}
        onChange={handlePageChange}
      />

      <Modal open={open} closeIcon={false} footer={false}>
        {item && <ModalContact id={item} onCancel={handleCancel} />}
      </Modal>
    </div>
  );
};

function ModalContact({ id, onCancel }) {
  const [selectedValueStatus, setSelectedValueStatus] = useState('pending');

  useEffect(() => {
    setSelectedValueStatus(id.status);
  }, [id]);

  const handleCancel = () => {
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/contacts/updateContact/${id._id}`,
        {
          status: selectedValueStatus,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleCopyClick = (content) => {
    handleCopy(content);
    toast.success('Copied to clipboard');
  };

  const optionStatus = [
    { value: 'pending', label: 'Pending' },
    { value: 'replied', label: 'Replied' },
  ];

  return (
    <div className="wrapper-modal-contact">
      <form action="" onSubmit={handleSubmit}>
        <h1 className="title-admin">Contact from users </h1>
        <label htmlFor="">Name</label>
        <p>
          {id.name} <CopyOutlined onClick={() => handleCopyClick(id.name)} />
        </p>
        <label htmlFor="">Email </label>
        <p>
          {id.email} <CopyOutlined onClick={() => handleCopyClick(id.email)} />
        </p>
        <label htmlFor="">Phone</label>
        <p>
          {id.phone} <CopyOutlined onClick={() => handleCopyClick(id.phone)} />
        </p>
        <label htmlFor="">Title</label>
        <p>
          {id.title}
          <CopyOutlined onClick={() => handleCopyClick(id.title)} />{' '}
        </p>
        <label htmlFor="">Content</label>
        <p>
          {id.content}{' '}
          <CopyOutlined onClick={() => handleCopyClick(id.content)} />
        </p>
        <label htmlFor="">Status</label>
        <Radio.Group
          block
          options={optionStatus}
          defaultValue="Thời Trang"
          optionType="button"
          buttonStyle="solid"
          value={selectedValueStatus}
          onChange={(e) => setSelectedValueStatus(e.target.value)}
        />
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

export default ManagerContact;
