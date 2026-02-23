import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Space, Avatar } from "antd";
import {
  DashboardOutlined,
  ProjectOutlined,
  BankOutlined,
  FileOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ClientPortalLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { clientUser, logout } = useClientAuth();

  const sidebarMenuItems: MenuProps["items"] = [
    {
      key: "/client-portal",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "/client-portal/projects",
      icon: <ProjectOutlined />,
      label: "Projects"
    },
    {
      key: "/client-portal/company",
      icon: <BankOutlined />,
      label: "Company"
    },
    {
      key: "/client-portal/reports",
      icon: <FileOutlined />,
      label: "Reports"
    }
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/client-portal" || path === "/client-portal/") return "/client-portal";
    if (path.startsWith("/client-portal/projects")) return "/client-portal/projects";
    if (path.startsWith("/client-portal/company")) return "/client-portal/company";
    if (path.startsWith("/client-portal/reports")) return "/client-portal/reports";
    return "/client-portal";
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header
        className="flex items-center justify-between px-4"
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 64,
          padding: "0 24px"
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">Client Portal</span>
          </div>
        </div>

        <Space size="middle">
          <div className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
            <Text className="hidden sm:inline text-gray-600">
              {clientUser?.name || clientUser?.email}
            </Text>
          </div>

          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          theme="light"
          className="border-r border-gray-100"
          style={{
            height: "calc(100vh - 64px)",
            position: "sticky",
            top: 64,
            left: 0
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={sidebarMenuItems}
            onClick={handleMenuClick}
            className="h-full border-r-0 pt-2"
            style={{ borderRight: "none" }}
          />
        </Sider>

        {/* Main Content */}
        <Content
          className="p-6"
          style={{
            height: "calc(100vh - 64px)",
            overflow: "auto",
            background: "linear-gradient(#ffffff, #f5f5f5 28%)"
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientPortalLayout;
