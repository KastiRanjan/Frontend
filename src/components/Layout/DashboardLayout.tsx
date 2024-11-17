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
        <div className="ant-pro-layout-bg-list css-1qeeczj" >
          <img src="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr"
            style={{ position: 'absolute', left: '85px', bottom: '100px', height: "303px" }} />
          <img src="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr"
            style={{ position: 'absolute', bottom: '-68px', right: '-45px', height: "303px" }} />
          <img src="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr"
            style={{ position: 'absolute', bottom: '0px', left: '0px', width: '331px' }} /></div>
        <Sidebar collapsed={collapsed} menuItems={MenuItems()} />
        <Content
          className="p-4 relative"
          style={{ height: "calc(100vh - 64px)", overflow: "auto" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
