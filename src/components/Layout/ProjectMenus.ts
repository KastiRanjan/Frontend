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
    key: "/project/details",
    label: "Details",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/project/tasks",
    label: "Tasks",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/project/effort-report",
    label: "Effort Report",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/project/cost-report",
    label: "Cost Report",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: "/project/worklogs",
    label: "Worklogs",
    icon: React.createElement(DashboardOutlined),
  },
  {
    key: `/project/${id}/worklogs`,
    label: "Worklog",
    icon: React.createElement(DashboardOutlined),
  },
  
];
