import { DashboardOutlined, UserOutlined, ProjectOutlined, FileDoneOutlined, SolutionOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
}

export const MenuItems = [
  {
    key: "/",
    label: "Dashboard",
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
    key: "/task",
    label: "Task",
    icon: React.createElement(CalendarOutlined),
  },
  {
    key: "/worklog",
    label: "WorkLog",
    icon: React.createElement(TeamOutlined),
  },
];

