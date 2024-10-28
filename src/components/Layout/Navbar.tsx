import { useSession } from "@/context/SessionContext";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useContext } from "react";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: any;
}) => {
  const { profile, isProfilePending } = useSession();
  console.log(profile);

  return (
    <Header className="border-b-[3px] bg-[#fff] p-0 flex items-center justify-between">
      <div className="flex items-center">
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
      </div>
      <div className="pr-4">
        <Avatar
          // loading={isProfilePending}
          style={{ backgroundColor: "#0c66e4" }}
        >
          {profile?.name[0]}
        </Avatar>
      </div>
    </Header>
  );
};

export default React.memo(Navbar);
