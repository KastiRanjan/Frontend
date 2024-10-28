import {
  DashboardOutlined
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const ProjectMenuItems: MenuItem[] = [
  {
    key: "/project/tasks",
    label: "Tasks",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/project/users",
    label: "Users",
    icon: React.createElement(DashboardOutlined),
  },
  
];
