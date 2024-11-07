import { useSession } from "@/context/SessionContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import {
  BellOutlined,
  InfoCircleFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, Dropdown } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link } from "react-router-dom";
import Clock from "../Clock/Clock";
import React from "react";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: any;
}) => {
  const { profile } = useSession();
  const { data: notification } = useMyNotifications()
  const { mutate: logout } = useLogout();

  return (
    <Header className="border-b-[2px] bg-[#fff] p-0 flex items-center justify-between">
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
          <Breadcrumb
            items={[
              { title: <Link to="/">Home</Link> },
              { title: "Dashboard" },
            ]}
          />
        </span>
      </div>

      <Clock />

      <div className="pr-4 flex gap-5 items-center">
        <InfoCircleFilled style={{ fontSize: "22px" }} />
        <Badge count={notification?.length}>
          <BellOutlined style={{ fontSize: "22px" }} />
        </Badge>
        <Dropdown placement="bottomLeft" menu={{
          items: [
            { label: profile?.name, key: "name" },
            { label: <Link to="/profile">Profile</Link>, key: "profile" },
            { label: <Link to="/reset-password">Reset Password</Link>, key: "reset-password" },
            {
              label: (
                <span
                  onClick={() => {
                    logout()
                  }}
                >
                  Logout
                </span>
              ),
              key: "logout",
            },
          ]
        }}>
          <Avatar
            // loading={isProfilePending}
            style={{ backgroundColor: "#0c66e4" }}
          >
            {profile?.name[0]}
          </Avatar>
        </Dropdown>
      </div>
    </Header>
  );
};

export default React.memo(Navbar);
