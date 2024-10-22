import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Breadcrumb, Button } from "antd";
import { Header } from "antd/es/layout/layout";
import React from "react";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: any;
}) => {
  return (
    <Header className="border-b bg-[#fff] p-0 flex items-center">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <span>
        <Breadcrumb items={[{ title: "Home" }, { title: "Dashboard" }]} />
      </span>
    </Header>
  );
};

export default React.memo(Navbar);
