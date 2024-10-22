import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  FileDoneOutlined,
  SolutionOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
}

export const SettingMenus = [
  {
    key: "/general-settings",
    label: "General Settings",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/role",
    label: "Role",
    icon: React.createElement(SolutionOutlined),
  },
  {
    key: "/permission",
    label: "Permission",
    icon: React.createElement(FileDoneOutlined),
  },
  {
    key: "/client",
    label: "Client",
    icon: React.createElement(UserOutlined),
  },
  {
    key: "/project",
    label: "Project",
    icon: React.createElement(ProjectOutlined),
  },
];
