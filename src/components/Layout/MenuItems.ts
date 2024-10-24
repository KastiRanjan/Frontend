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
    key: "/users",
    label: "Users",
    icon: React.createElement(UserOutlined),
  },
  {
    key: "/project",
    label: "Project",
    icon: React.createElement(ProjectOutlined),
  },
  {
    key: "/task-template",
    label: "Task Template",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "/task-group",
    label: "Task Group",
    icon: React.createElement(TeamOutlined),
  },
  {
    key: "/client",
    label: "Client",
    icon: React.createElement(UserOutlined),
  },
  {
    key: "/permission",
    label: "Settings",
    icon: React.createElement(TeamOutlined),
  },
];
