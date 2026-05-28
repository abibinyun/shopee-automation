import React, { useContext, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import OrderTable from "../tables/OrderTable";
import SoftwareTable from "../tables/SoftwareTable";
import VersionTable from "../tables/VersionTable";
import LicenseTable from "../tables/LicenseTable";
import HomeView from "../tables/HomeView";
import { AuthContext } from "../../context/AuthContext";
import ChangePass from "../../pages/ChangePass";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useContext(AuthContext); // Import logout function

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const styleLogo = {
    fontSize: "20px",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            if (key === "logout") {
              logout(); // Logout user
            } else {
              navigate(key);
            }
          }}
          items={[
            { key: "", label: "Kinterstore", style: styleLogo },
            { key: "/", icon: <UserOutlined />, label: "Home" },
            { key: "/orders", icon: <VideoCameraOutlined />, label: "Pesanan" },
            { key: "/software", icon: <UploadOutlined />, label: "Software" },
            { key: "/version", icon: <UploadOutlined />, label: "Version" },
            { key: "/license", icon: <UploadOutlined />, label: "Lisensi" },
            { key: "/change-password", icon: <SettingOutlined />, label: "Ganti Password", danger: true },
            { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
          ]}
        />
      </Sider>
      <Layout style={{ flex: 1 }}>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 48,
              height: 48,
            }}
          />
          <Button type="primary" danger onClick={logout}>
            Logout
          </Button>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            flex: 1,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/orders" element={<OrderTable />} />
            <Route path="/software" element={<SoftwareTable />} />
            <Route path="/version" element={<VersionTable />} />
            <Route path="/license" element={<LicenseTable />} />
            <Route path="/change-password" element={<ChangePass />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
