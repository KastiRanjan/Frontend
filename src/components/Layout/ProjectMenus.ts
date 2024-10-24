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

export const ProjectMenuItems: MenuItem[] = [
  {
    key: "/project/tasks",
    label: "Tasks",
    icon: React.createElement(DashboardOutlined),
  },
  
];
