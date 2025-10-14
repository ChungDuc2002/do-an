import React, { useEffect, useState } from 'react';
import { Button, Modal, Pagination, Table } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import './style.scss';

const ManagerBanner = () => {
  const [modalAddNewBanner, setModalAddNewBanner] = useState(false);
  const [listBanner, setListBanner] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  //* Get all banner
  useEffect(() => {
    document.title = 'Quản lý banner';
    const getAllBanner = async () => {
      try {
        const res = await axios.get('http://localhost:5000/slides/getSlides');
        setListBanner(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllBanner();
  }, []);

  //* LOGIC PAGINATION---------------
  // Tính toán chỉ mục bắt đầu và kết thúc của người dùng trên trang hiện tại
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = listBanner.slice(indexOfFirstUser, indexOfLastUser);

  // Xử lý sự kiện chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //* Table render
  const columns = [
    // { title: 'Image', dataIndex: 'image', key: 'image' },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (text, record) => (
        <img
          src={require(`../../../../../../server/uploads/${record.image}`)}
          alt={record.title}
          className="render_image"
        />
      ),
    },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Created At',
      key: 'createdAt',
      render: (text, record) => (
        <span>{moment(record.createdAt).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Updated At',
      key: 'updatedAt',
      render: (text, record) => (
        <span>
          {moment(record.updatedAt).format('DD/MM/YYYY - h :mm :ss a')}
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
              handleEditBanner(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            className="btn-action"
            onClick={() => {
              handleDeleteBanner(record);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const handleCancel = () => {
    setModalAddNewBanner(false);
    setOpen(false);
  };

  //* LOGIC delete banner-----------
  const handleDeleteBanner = async (record) => {
    if (window.confirm('Bạn có chắc muốn xóa banner này không ?')) {
      try {
        const result = await axios.delete(
          `http://localhost:5000/slides/deleteSlide/${record._id}`
        );
        if (result.status === 200) {
          const newBanner = listBanner.filter(
            (item) => item._id !== record._id
          );
          setListBanner(newBanner);
          toast.success('Delete banner success');
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  //* LOGIC edit banner-----------
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState();
  const handleEditBanner = (record) => {
    setOpen(true);
    setItem(record._id);
    console.log(record);
  };

  return (
    <div className="wrapper-manager-banner">
      <div className="group-btn">
        <Button
          className="btn-add-banner"
          onClick={() => {
            setModalAddNewBanner(!modalAddNewBanner);
          }}
        >
          Thêm mới banner
        </Button>
      </div>
      <Table columns={columns} dataSource={currentUsers} pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={usersPerPage}
        total={listBanner.length}
        onChange={handlePageChange}
      />
      <Modal
        open={modalAddNewBanner}
        onCancel={handleCancel}
        closeIcon={false}
        footer={false}
      >
        <AddNewBanner onCancel={handleCancel} />
      </Modal>
      <Modal
        open={open}
        onCancel={handleCancel}
        closeIcon={false}
        footer={false}
      >
        {item && <ModalEditBanner id={item} onCancel={handleCancel} />}
      </Modal>
    </div>
  );
};

function AddNewBanner({ onCancel }) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  const onInputChange = (e) => {
    setImage(e.target.files[0]);
  };

  //* LOGIC UPLOAD IMAGE
  const submitImage = async () => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);
    formData.append('title', title);

    await axios.post('http://localhost:5000/slides/uploadSlide', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleCancel = () => {
    onCancel();
  };
  return (
    <div className="wrapper-add-banner">
      <h1 className="title-admin">Thêm mới banner</h1>
      <form action="" onSubmit={submitImage}>
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Selected"
            className="render_add-new-banner"
          />
        )}
        <input type="file" accept="image/*" onChange={onInputChange} />
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />{' '}
        <input
          type="text"
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
function ModalEditBanner({ id, onCancel }) {
  const [slideUpdate, setSlideUpdate] = useState({});
  const [imageFile, setImageFile] = useState();
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const getUserById = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/slides/getSlideById/${id}`
        );
        setSlideUpdate(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getUserById();
    console.log(imageFile);
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageFile(file);
      setPreviewImage(reader.result);
      setSlideUpdate({ ...slideUpdate, image: file });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSlide = async () => {
    try {
      const formData = new FormData();
      formData.append('image', slideUpdate.image);
      formData.append('trademark', slideUpdate.trademark);
      formData.append('title', slideUpdate.title);

      const result = await axios.put(
        `http://localhost:5000/slides/updateSlide/${id}`,
        formData
      );
      if (result.status === 200) {
        toast.success('Update banner success');
      }
      console.log(slideUpdate.image);
    } catch (error) {
      toast.error('Update banner fail !');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="wrapper-edit-banner">
      <h1 className="title-admin">Edit Banner</h1>
      <form action="" onSubmit={handleUpdateSlide}>
        {slideUpdate && (
          <div className="form_edit">
            {slideUpdate.image && (
              <img
                src={
                  previewImage ||
                  require(`../../../../../../server/uploads/${slideUpdate.image}`)
                }
                alt="Banner"
                className="render_img"
              />
            )}

            <input
              type="file"
              onChange={handleImageChange}
              style={{ border: 'none', padding: '0' }}
            />
            <input
              type="text"
              value={slideUpdate.trademark}
              onChange={(e) =>
                setSlideUpdate({ ...slideUpdate, trademark: e.target.value })
              }
            />
            <input
              type="text"
              value={slideUpdate.title}
              onChange={(e) =>
                setSlideUpdate({ ...slideUpdate, title: e.target.value })
              }
            />
            <div className="group-btn">
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default ManagerBanner;
