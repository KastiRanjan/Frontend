import {
  DashboardOutlined,
  FileDoneOutlined,
  ProjectOutlined,
  SolutionOutlined,
  UserOutlined
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const SettingMenus: MenuItem[] = [
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
