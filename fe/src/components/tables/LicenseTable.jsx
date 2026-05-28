import React, { 
  useState, 
  useEffect 
} from 'react';
import { 
  getAllSoftware, 
  addMultipleLicenses, 
  updateLicensesMultiple, 
  getAllAvailableLicenses, 
  getSoftwareVersionByParamSoftwareId,
  deleteMultipleLicenses
} from '../../services/api';
import MainTable from './MainTable';
import { 
  Button, 
  Form, 
  message, 
  Modal, 
  Input, 
  Select, 
  Table
} from "antd";
import _ from 'lodash';

const ModalDelete = ({
  isDeleteModalVisible, 
  setIsDeleteModalVisible, 
  licensesToDelete,
  selectedLicenses,
  setSelectedLicenses,
  handleDeleteSelected
}) => {
  return (
    <Modal
      title={`Delete Licenses ${licensesToDelete[0]?.Software.name} - ${licensesToDelete[0]?.software_version_id ?? "No Version"}`}
      open={isDeleteModalVisible}
      onCancel={() => setIsDeleteModalVisible(false)}
      footer={null}
    >
      <Table
        dataSource={licensesToDelete}
        rowKey="license_key"
        rowSelection={{
          selectedRowKeys: selectedLicenses,
          onChange: (selectedRowKeys) => setSelectedLicenses(selectedRowKeys),
        }}
        columns={[
          { title: "License Key", dataIndex: "license_key", key: "license_key" },
        ]}
      />

      <Button 
        type="primary" 
        danger 
        onClick={handleDeleteSelected} 
        style={{ marginTop: 10 }}
        disabled={selectedLicenses?.length === 0}
      >
        Delete Selected
      </Button>
    </Modal>

  )
}

const LicenseTable = () => {
  const [licenses, setLicenses] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [softwareVersions, setSoftwareVersions] = useState([]);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [errorVersion, setErrorVersion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newLicenses, setNewLicenses] = useState({
    name: "",
    software_version_id: "",
    software_id: null,
    license_keys: ""
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [licensesToDelete, setLicensesToDelete] = useState([]);


  useEffect(() => {
    getAllAvailableLicenses(setLicenses, setLoading, setError);
    if (isModalVisible) {
      getAllSoftware(setSoftwareList, setLoadingSoftware, setError);
    }
  }, [isModalVisible, isDeleteModalVisible]);

  useEffect(() => {
    if (newLicenses.software_id) {
      getSoftwareVersionByParamSoftwareId(
        newLicenses.software_id,
        setSoftwareVersions,
        setLoadingVersion,
        setErrorVersion
      );
    }
  }, [newLicenses.software_id]); 

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (errorVersion) return <div>Error: {errorVersion}</div>;

  const groupedData = _.groupBy(licenses, (item) => `${item?.software_id}-${item?.software_version_id}`);
  const tableData = Object.keys(groupedData).map((key) => {
    const softwareGroup = groupedData[key];

    return {
      software_id: softwareGroup[0]?.software_id,
      name: softwareGroup[0]?.Software?.name || "Unknown",
      software_version_id: [softwareGroup[0]?.software_version_id || "-", softwareGroup[0]?.SoftwareVersion?.version || "-" ],
      os: softwareGroup[0]?.SoftwareVersion?.os || "-",
      license_keys: softwareGroup
        .map((item) => item?.license_key?.trim())
        .filter((key) => key && key?.length > 0)
        .join(", ") || "No License Key",
      amount: softwareGroup.length || 0,
    };
  });

  const columns = [
    { 
      title: "Software Name", 
      dataIndex: "name", 
      key: "name",
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: "Version",
      dataIndex: "software_version_id",
      key: "software_version_id",
      render: (id, record) => {
        return record.software_version_id[1]
      }
    },    
    {
      title: "OS",
      dataIndex: "os",
      key: "os",
    },    
    { 
      title: "License Keys", 
      dataIndex: "license_keys", 
      key: "license_keys",
      render: (licenses) => {
        if (!licenses) return "-";
        const licenseArray = Array.isArray(licenses) ? licenses : licenses.split(",");
        return licenseArray.slice(0, 5).join(", ") + (licenseArray.length > 5 ? " ..." : "");
      }, 
    },
    { title: "Available", dataIndex: "amount", key: "amount" },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <>
          <Button style={{ marginLeft: 8 }} onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger style={{ marginLeft: 8 }} onClick={() => showDeleteModal(record)}>Delete</Button>
        </>
      ),
    },
  ];

  const handleAddData = () => {
    setIsModalVisible(true);
  };

  const handleSoftwareChange = (value) => {
    setNewLicenses((prevState) => ({
      ...prevState,
      software_id: value, 
    }));
  };

  const handleSoftwareVersionChange = (value) => {
    setNewLicenses((prevState) => ({
      ...prevState,
      software_version_id: value, 
    }));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false)
    setNewLicenses({
      name: "",
      software_id: null,
      license_keys: ""
    })
  };

  const handleOk = async () => {
    const licenseKeysArray = newLicenses.license_keys
      .split(/,|\n/)
      .map((key) => key.trim())
      .filter((key) => key?.length > 0);

    const uniqueLicenseKeys = _.uniq(licenseKeysArray);

    if (isEditMode) {
      const response = await updateLicensesMultiple({
        software_id: newLicenses.software_id,
        license_keys: uniqueLicenseKeys,
        software_version_id: newLicenses.software_version_id[0] === "-" ? null : newLicenses.software_version_id[0]
      }, setLicenses, setLoading, setError);
      
      if (response.status === 200) {
        message.success("Software licenses updated successfully!");
        setIsModalVisible(false);
        setNewLicenses({ software_id: null, license_keys: "" });
        setIsEditMode(false);
      }
    } else {
      const response = await addMultipleLicenses(
        { software_id: newLicenses.software_id, license_keys: licenseKeysArray, software_version_id: newLicenses.software_version_id },
        setLicenses,
        setLoading,
        setError
      );
  
      if (response.status === 201) {
        message.success("Software licenses added successfully!");
        setIsModalVisible(false);
        setNewLicenses({ software_id: null, license_keys: "" });
      }
    }
  };
  
  const handleEdit = (software) => {
    setIsEditMode(true);
    setNewLicenses(software);
    setIsModalVisible(true);
  };

  const showDeleteModal = (software) => {    
    let dataFilter
    if(software.software_version_id[0] !== "-"){
      dataFilter = licenses.filter(license => license.software_id === software.software_id && license.software_version_id === software.software_version_id[0])
    } else {
      dataFilter = licenses.filter(license => license.software_id === software.software_id)
    }

    setLicensesToDelete(dataFilter);
    setIsDeleteModalVisible(true);
  };  

  const handleDeleteSelected = async () => {
    if (selectedLicenses?.length === 0) {
      message.warning("No license selected!");
      return;
    }
  
    const isConfirmed = window.confirm(
      `You are about to delete ${selectedLicenses?.length} license(s). Are you sure?`
    );
  
    if (!isConfirmed) return;
  
    try {
      const response = await deleteMultipleLicenses(
        { licenses: selectedLicenses },
        setLoading,
        setError
      );
  
      if (response.status === 200) {
        message.success("Selected licenses deleted successfully!");
        setIsDeleteModalVisible(false);
      }
    } catch (error) {
      message.error("Failed to delete selected licenses.");
    }
  };    

  return (
    <div>
      <MainTable data={tableData} columns={columns} onAdd={handleAddData} />
      <Modal 
        title={isEditMode ? `Edit Software License ${newLicenses.name}` : "Add Software License"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? "Update" : "Add"}
      >
        <Form>
          <Form.Item label="Software">
            <Select
              name="software_id"
              value={newLicenses.software_id}
              onChange={handleSoftwareChange}
              loading={loadingSoftware}
              showSearch
              placeholder="Select Software"
              optionFilterProp="children"
              disabled={isEditMode}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {softwareList
                .filter((software) => software.requires_license)
                .map((software) => (
                  <Select.Option key={software.id} value={software.id}>
                    {software.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Version">
            <Select
              name="software_version_id"
              value={newLicenses.software_version_id}
              onChange={handleSoftwareVersionChange}
              loading={loadingVersion}
              showSearch
              placeholder="Select Software Version"
              optionFilterProp="children"
              disabled={
                isEditMode ||
                newLicenses.software_id === null || 
                !softwareList.find((s) => s.id === newLicenses.software_id)?.search_by_version 
              }
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {softwareVersions
                .filter(
                  (softwareVersion) =>
                    softwareVersion.software_id === newLicenses.software_id
                )
                .map((softwareVersion) => (
                  <Select.Option key={softwareVersion.id} value={softwareVersion.id}>
                    {`${softwareVersion.version} - ${softwareVersion.os}` }
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>


          <Form.Item label="License Keys">
            <Input.TextArea
              name="license_keys"
              value={newLicenses.license_keys}
              onChange={(e) => setNewLicenses((prev) => ({ ...prev, license_keys: e.target.value }))}
              placeholder="Enter license keys separated by comma or new line"
            />
          </Form.Item>
        </Form>
      </Modal>

      <ModalDelete 
        isDeleteModalVisible={isDeleteModalVisible}
        licensesToDelete={licensesToDelete}
        selectedLicenses={selectedLicenses}
        setIsDeleteModalVisible={setIsDeleteModalVisible}
        setSelectedLicenses={setSelectedLicenses}
        handleDeleteSelected={handleDeleteSelected}
        />
    </div>
  );
};

export default LicenseTable;