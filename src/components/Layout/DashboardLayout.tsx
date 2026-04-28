import { Layout } from "antd";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { MenuItems } from "./MenuItems";

const { Content } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen overflow-hidden">
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout
        hasSider
        className="flex-1 min-h-0 overflow-hidden"
        style={{ background: "linear-gradient(#ffffff, #f5f5f5 28%)" }}
      >
        <Sidebar collapsed={collapsed} menuItems={MenuItems()} />
        <Content
          className="p-2 relative flex-1 min-h-0"
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
