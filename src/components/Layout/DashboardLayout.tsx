import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout } from "antd";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const { Header, Content } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: "100vh" }}>
      <Sidebar collapsed={collapsed} />
      <Layout className="bg-[#fff] h-screen overflow-hidden">
       <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="px-6" style={{ height: "calc(100vh - 64px)", overflow: "auto" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "Home" }, { title: "Dashboard" }]}
          />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
