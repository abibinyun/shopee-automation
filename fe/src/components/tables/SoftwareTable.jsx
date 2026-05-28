import React, { useState, useEffect } from 'react';
import { addSoftware, deleteSoftware, getAllSoftware, updateSoftware } from '../../services/api'; // Sesuaikan dengan path file API
import MainTable from './MainTable';
import { Button, Form, message, Modal, Popconfirm, Input } from "antd";

const SoftwareTable = () => {
  const [softwareData, setSoftwareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newSoftware, setNewSoftware] = useState({
    name: '',
    requires_license: false,
    search_by_version: false
  });

  useEffect(() => {
    getAllSoftware(setSoftwareData, setLoading, setError);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDelete = (id) => {
    deleteSoftware(id, setSoftwareData, setLoading, setError);
    message.success("Software berhasil dihapus!");
  };

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (isEditMode) {
      const response = await updateSoftware(newSoftware, setSoftwareData, setLoading, setError);
  
      if (response.status === 200) {
        message.success("Software berhasil diperbarui!");
        setIsModalVisible(false);
        setIsEditMode(false);
        setNewSoftware({ name: "", requires_license: false, search_by_version: false });
      }
    } else {
      const response = await addSoftware(newSoftware, setSoftwareData, setLoading, setError);
  
      if (response.status === 201) {
        message.success("Software berhasil ditambahkan!");
        setIsModalVisible(false);
        setNewSoftware({ name: "", requires_license: false, search_by_version: false });
      }
    }
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSoftware((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLicenseChange = (e) => {
    const newRequiresLicense = e.target.checked;
  
    setNewSoftware((prevState) => ({
      ...prevState,
      requires_license: newRequiresLicense,
      search_by_version: !newRequiresLicense ? false : prevState.search_by_version,
    }));
  };

  const handleSearchByVersion = (e) => {
    setNewSoftware((prevState) => ({
      ...prevState,
      search_by_version: e.target.checked,
    }));
  };

  const handleEdit = (software) => {
    setIsEditMode(true);
    setNewSoftware(software);
    setIsModalVisible(true);
  };

  const columns = [
    { 
      title: "Name Software", 
      dataIndex: "name", 
      key: "name" ,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: "Requires License",
      dataIndex: "requires_license",
      key: "requires_license",
      render: (text) => (text ? "Yes" : "No"),
    },
    {
      title: "Search By Version",
      dataIndex: "search_by_version",
      key: "search_by_version",
      render: (text) => (text ? "Yes" : "No"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm title="Yakin ingin menghapus?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Hapus</Button>
          </Popconfirm>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </>
      ),
    },
  ];

  return( 
  <div>

    <MainTable data={softwareData} columns={columns} onAdd={handleAddData} />
  
    <Modal
        title={isEditMode ? "Edit Software" : "Add New Software"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? "Update" : "Add"}
      >
        <Form>
          <Form.Item label="Software Name">
            <Input
              name="name"
              value={newSoftware.name}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Requires License">
            <Input
              name="requires_license"
              type="checkbox"
              checked={newSoftware.requires_license}
              onChange={handleLicenseChange}
            />
          </Form.Item>
          <Form.Item label="Search by Version">
            <Input
              name="search_by_version"
              type="checkbox"
              checked={newSoftware.search_by_version}
              disabled={newSoftware.requires_license === false}
              onChange={handleSearchByVersion}
            />
          </Form.Item>
        </Form>
      </Modal>
  </div>
)
};

export default SoftwareTable;
