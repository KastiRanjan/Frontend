import {
  ClusterOutlined,
  DashboardOutlined,
  FileOutlined,
  FolderOutlined,
  ProjectOutlined,
  SettingOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const MenuItems: MenuItem[] = [
  {
    key: "/",
    label: "Dashboard",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/users",
    label: "Users",
    icon: React.createElement(UsergroupAddOutlined),
  },
  {
    key: "/project",
    label: "Project",
    icon: React.createElement(ProjectOutlined),
  },
  {
    key: "/task-template",
    label: "Task Template",
    icon: React.createElement(FileOutlined),
  },
  {
    key: "/task-group",
    label: "Task Group",
    icon: React.createElement(ClusterOutlined),
  },
  {
    key: "/client",
    label: "Client",
    icon: React.createElement(UserOutlined),
  },
  {
    key: "/attendence",
    label: "Attendence",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "/permission",
    label: "Settings",
    icon: React.createElement(SettingOutlined),
  },
];
