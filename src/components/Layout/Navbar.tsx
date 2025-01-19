import { useSession } from "@/context/SessionContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMyNotifications } from "@/hooks/notification/useMyNotifications";
import {
  BellOutlined,
  DownOutlined,
  FileDoneOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Popover,
  Select,
  Space,
} from "antd";
import { Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../Notification/Notification";
import SearchBarWithPopover from "../SearchBarPopover";

const Navbar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const { profile } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const { data: notification } = useMyNotifications();
  const { mutate: logout } = useLogout();
  // const location = useGeoLocation()

  return (
    <Header className="border-b-[1px] bg-[#fff] p-0 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-[32px]  m-5 rounded">
          <div className="relative z-20 flex items-center text-lg font-medium ">
            <div className="bg-gradient-to-br from-[#0c66e4] to-[#337ab7]  rounded py-1 px-1 mr-3 rotate-45">
              <div className="bg-white p-1 shadow">
                <div className="h-2 w-2 rounded-full bg-[#FF5349] shadow"></div>
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF5349"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
                </svg> */}
              </div>
            </div>
            <div className={`${collapsed ? "hidden" : "visible"}`}>
              <h5>Artha task</h5>
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
        <SearchBarWithPopover />
      </div>

      {/* <Clock /> */}
      {/* <Title level={5}> {location?.country}</Title> */}
      <div className="pr-4 flex gap-4 items-center">
        <FileDoneOutlined
          style={{ fontSize: "20px" }}
          className="cursor-pointer"
          onClick={() => {
            navigate("/settings");
          }}
        />
        <Badge
          count={notification?.length > 9 ? "9+" : notification?.length}
          onClick={showDrawer}
        >
          <BellOutlined style={{ fontSize: "20px" }} />
        </Badge>
        <SettingOutlined
          style={{ fontSize: "20px" }}
          className="cursor-pointer"
          onClick={() => {
            navigate("/settings");
          }}
        />

        <Drawer
          placement="right"
          closable={false}
          onClose={onClose}
          open={open}
          width={350}
        >
          <Title level={4}>Notifications</Title>
          <Notification />
        </Drawer>
        <Dropdown
          placement="bottomLeft"
          menu={{
            items: [
              {
                label: <div className="py-2 border-b">{profile?.email}</div>,
                key: "name",
              },
              {
                label: <Link to={`/profile/${profile?.id}`}>Profile</Link>,
                key: "profile",
              },
              {
                label: <Link to="/reset-password">Reset Password</Link>,
                key: "reset-password",
              },
              {
                label: (
                  <span
                    onClick={() => {
                      logout();
                    }}
                  >
                    Logout
                  </span>
                ),
                key: "logout",
              },
            ],
          }}
        >
          <div>
            <Avatar
              // loading={isProfilePending}
              src={`${import.meta.env.VITE_BACKEND_URI}/document/${
                profile?.avatar
              }`}
              style={{ backgroundColor: "#0c66e4" }}
            >
              {profile?.name[0]}
            </Avatar>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default React.memo(Navbar);

const { Option } = Select;
const selectAfter = (
  <>
    <Popover
      content={
        <>
          <Space direction="vertical" style={{ display: "flex" }}>
            <Select defaultValue=".com" style={{ width: "100%" }}>
              <Option value=".com">.com</Option>
              <Option value=".jp">.jp</Option>
              <Option value=".cn">.cn</Option>
              <Option value=".org">.org</Option>
            </Select>
            <Select defaultValue=".com" style={{ width: "100%" }}>
              <Option value=".com">.com</Option>
              <Option value=".jp">.jp</Option>
              <Option value=".cn">.cn</Option>
              <Option value=".org">.org</Option>
            </Select>
          </Space>
        </>
      }
      trigger="click"
    >
      <a>
        Click me <DownOutlined />
      </a>
    </Popover>
  </>
);
