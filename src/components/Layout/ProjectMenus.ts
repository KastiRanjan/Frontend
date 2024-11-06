import {
  DashboardOutlined
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const ProjectMenuItems=(id:string) => [
  {
    key: `/project/${id}/tasks`,
    label: "Tasks",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: `/project/${id}/users`,
    label: "Users",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: `/project/${id}/worklogs`,
    label: "Worklog",
    icon: React.createElement(DashboardOutlined),
  },
  
];
