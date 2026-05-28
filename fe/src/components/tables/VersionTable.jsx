import React, { useState, useEffect } from 'react';
import { getAllSoftwareVersion, addSoftwareVersion, updateSoftwareVersion, deleteSoftwareVersion, getAllSoftware } from '../../services/api'; // Sesuaikan dengan path file API
import MainTable from './MainTable';
import { Button, Form, message, Modal, Popconfirm, Input, Select } from "antd";

const VersionTable = () => {
  const [softwareVersions, setSoftwareVersions] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [loadingSoftware, setLoadingSoftware] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newSoftwareVersion, setNewSoftwareVersion] = useState({
    name: "",
    software_id: null, 
    version: null, 
    os: "", 
    download_link: ""
  });

  useEffect(() => {
    getAllSoftwareVersion(setSoftwareVersions, setLoading, setError);
    if (isModalVisible) {
        getAllSoftware(setSoftwareList, setLoadingSoftware, setError); 
      }
  }, [isModalVisible]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDelete = (id) => {
    deleteSoftwareVersion(id, setSoftwareVersions, setLoading, setError);
    message.success("Software berhasil dihapus!");
  };

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (isEditMode) {
      const response = await updateSoftwareVersion(newSoftwareVersion, setSoftwareVersions, setLoading, setError);
  
      if (response.status === 200) {
        message.success("Software berhasil diperbarui!");
        setIsModalVisible(false);
        setIsEditMode(false);
        setNewSoftwareVersion({
            name: "",
            software_id: null, 
            version: null, 
            os: "", 
            download_link: ""
        });
      }
    } else {
      const response = await addSoftwareVersion(newSoftwareVersion, setSoftwareVersions, setLoading, setError);

      if (response.status === 201) {
        message.success("Software berhasil ditambahkan!");
        setIsModalVisible(false);
        setNewSoftwareVersion({
            name: "",
            software_id: null, 
            version: null, 
            os: "", 
            download_link: ""
        });
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSoftwareVersion((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSoftwareChange = (value) => {
    setNewSoftwareVersion((prevState) => ({
      ...prevState,
      software_id: value,
    }));
  };

  const handleEdit = (software) => {
    setIsEditMode(true);
    setNewSoftwareVersion(software);
    setIsModalVisible(true);
  };

  const columns = [
    { 
      title: "Name Software", 
      dataIndex: "name", 
      key: "name",
      render: (text) => text,
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    { 
      title: "Version", 
      dataIndex: "version", 
      key: "version",
      render: (text) => text,
    },
    { 
      title: "OS", 
      dataIndex: "os", 
      key: "os",
      render: (text) => text,
    },
    { 
      title: "Download Link", 
      dataIndex: "download_link", 
      key: "download_link",
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
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
    <MainTable data={
        softwareVersions.map((version) => ({
            id: version.id,
            name: version.Software ? version.Software.name : "Unknown",
            version: version.version,
            os: version.os,
            download_link: version.download_link,
            software_id: version.software_id,
          }))
    } columns={columns} onAdd={handleAddData} />
  
    <Modal
        title={isEditMode ? "Edit Software Version" : "Add New Software Version"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? "Update" : "Add"}
      >
        <Form>
          <Form.Item label="Software">
            <Select
              name="software_id"
              value={newSoftwareVersion.software_id}
              onChange={handleSoftwareChange}
              loading={loadingSoftware}
              showSearch
              placeholder="Pilih Software"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {softwareList.map((software) => (
                <Select.Option key={software.id} value={software.id}>
                  {software.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Software Version">
            <Input
              name="version"
              value={newSoftwareVersion.version}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="OS">
            <Input
              name="os"
              value={newSoftwareVersion.os}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Download Link">
            <Input
              name="download_link"
              value={newSoftwareVersion.download_link}
              onChange={handleInputChange}
            />
          </Form.Item>
        </Form>
      </Modal>
  </div>
)
};

export default VersionTable;
