import { Layout } from "antd";
import React, { useState } from "react";
import Navbar from "./Navbar";
import { ProjectMenuItems } from "./ProjectMenus";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";

const { Content } = Layout;

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { id } = useParams();

  return (
    <Layout hasSider>
      <Sidebar collapsed={collapsed} menuItems={ProjectMenuItems(id)} />
      <Layout className="bg-[#fff] h-screen overflow-hidden">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          className="px-6 relative"
          style={{ height: "calc(100vh - 64px)", overflow: "auto" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProjectLayout;
