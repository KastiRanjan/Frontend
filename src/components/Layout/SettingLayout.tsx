import { Layout } from "antd";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { SettingMenus } from "./SettingMenus";

const { Content } = Layout;

const SettingLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: "100vh" }}>
      <Sidebar collapsed={collapsed} menuItems={SettingMenus} />
      <Layout className="bg-[#fff] h-screen overflow-hidden">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="px-6"
          style={{ height: "calc(100vh - 64px)", overflow: "auto" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SettingLayout;
