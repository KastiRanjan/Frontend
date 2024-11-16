import { useSession } from "@/context/SessionContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import {
  BellOutlined,
  InfoCircleFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, Drawer, Dropdown } from "antd";
import { Header } from "antd/es/layout/layout";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Clock from "../Clock/Clock";
import Notification from "../Notification/Notification";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: any;
}) => {
  const { profile } = useSession();
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const { data: notification } = useMyNotifications()
  const { mutate: logout } = useLogout();
  // const location = useGeoLocation()

  return (
    <Header className="border-b-[1px] bg-[#fff] p-0 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-[32px]  m-5 rounded">
          <div className="relative z-20 flex items-center text-lg font-medium ">
            <div className=" bg-[#0c66e4] rounded py-3 px-3 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
              </svg>
            </div>
            <div className={`${collapsed ? "hidden" : "visible"}`}>
              <h5>Artha task</h5>
              <p className="text-xs text-zinc-400 whitespace-nowrap">
                Manage your project
              </p>
            </div>
          </div>
        </div>
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
      </div>

      {/* <Clock /> */}
      {/* <Title level={5}> {location?.country}</Title> */}
      <div className="pr-4 flex gap-8 items-center">
        <Badge count={notification?.length > 9 ? '9+' : notification?.length} onClick={showDrawer}>
          <BellOutlined style={{ fontSize: "22px" }} />
        </Badge>

        <Drawer
          placement="right"
          closable={false}
          onClose={onClose}
          open={open}
          width={350}

        >
          <Notification />
        </Drawer>
        <Dropdown placement="bottomLeft" menu={{
          items: [
            { label:<div className="py-2 border-b">{ profile?.email}</div>, key: "name" },
            { label: <Link to={`/profile/${profile?.id}`}>Profile</Link>, key: "profile" },
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
          <div>
            <Avatar
              // loading={isProfilePending}
              src={`${import.meta.env.VITE_BACKEND_URI}/document/${profile?.avatar}`}
              style={{ backgroundColor: "#0c66e4" }}
            >
              {profile?.name[0]}
            </Avatar>
            <span className="ml-2"> {profile?.username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default React.memo(Navbar);
