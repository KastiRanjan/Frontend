import { Layout } from "antd";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { MenuItems } from "./MenuItems";

const { Content } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout >
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout hasSider className="h-screen overflow-hidden " style={{ background: 'linear-gradient(#ffffff, #f5f5f5 28%)' }}>
        <Sidebar collapsed={collapsed} menuItems={MenuItems()} />
        <Content
          className="p-2 relative"
          style={{ height: "calc(100vh - 64px)", overflow: "auto" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
