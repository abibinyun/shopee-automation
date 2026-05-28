import React from "react";
import { Table, Button, Tag } from "antd";

const MainTable = ({ data, columns, onAdd, btnAdd = true, expand = false}) => {
  
  const expandedRowRender = (record) => (
    <Table
      columns={[
        {
          title: "License Key",
          dataIndex: "license_key",
          key: "license_key",
          render: (license_key) => (
            <Tag color="blue">{license_key ?? "-"}</Tag>
          )
        },
        {
          title: "Status",
          dataIndex: "is_active",
          key: "is_active",
          render: (is_active) => (
            <Tag color={is_active ? "green" : "red"}>
              {is_active ? "Aktif" : "Nonaktif"}
            </Tag>
          ),
        },
        {
          title: "Tanggal",
          dataIndex: "used_at",
          key: "used_at",
          render: (used_at) => (
            <Tag>{used_at ? used_at.split("T")[0] : "-"}</Tag>
          )
        }        
      ]}
      dataSource={record.Licenses}
      pagination={false}
      size="small"
      rowKey="id"
    />
  );

  return (
    <div>
      {btnAdd && (
        <Button type="primary" onClick={onAdd} style={{ marginBottom: 16 }}>
          Add Data
        </Button>
      )}
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        expandable={expand ? { expandedRowRender } : undefined} // Tambahkan expandable
      />
    </div>
  );
};

export default MainTable;
