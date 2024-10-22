import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
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
    key: "/user",
    label: "User",
    icon: React.createElement(UserOutlined),
  },
  {
    key: "/project",
    label: "Project",
    icon: React.createElement(ProjectOutlined),
  },
  {
    key: "/tasktemplate",
    label: "Task Template",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "/task-group",
    label: "Task Group",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "/settings",
    label: "Settings",
    icon: React.createElement(TeamOutlined),
  },
];
