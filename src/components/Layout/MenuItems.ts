import { useSession } from "@/context/SessionContext";
import {
  DashboardOutlined,
  FileOutlined,
  ProjectOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  SafetyOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  NotificationOutlined,
  FolderOpenOutlined,
  SolutionOutlined
} from "@ant-design/icons";
import { MenuProps } from "antd";
import _ from "lodash";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const MenuItems = (): MenuProps[] => {
  const { permissions } = useSession()
  console.log(permissions)
  const items = [
    {
      key: "/",
      label: "Home",
      resource: "user",
      icon: React.createElement(DashboardOutlined),
    },
    {
      key: "/users",
      label: "Users",
      resource: "user",
      icon: React.createElement(UsergroupAddOutlined),
    },
    {
      key: "/projects",
      label: "Project",
      resource: "projects",
      icon: React.createElement(ProjectOutlined),
    },
    {
      key: "/calendar",
      label: "Calendar",
      resource: "calendar",
      icon: React.createElement(CalendarOutlined),
    },
    // {
    //   key: "/tasks",
    //   label: "Quick Tasks",
    //   resource: "tasks",
    //   icon: React.createElement(UsergroupAddOutlined),
    // },
    {
      key: "/task-template",
      label: "Task Template",
      resource: "task-template",
      icon: React.createElement(FileOutlined),
    },
    {
      key: "/tasks",
      label: "Tasks",
      resource: "tasks",
      icon: React.createElement(FileOutlined),
    },
    {
      key: "/client",
      label: "Client",
      resource: "client",
      icon: React.createElement(UserOutlined),
    },
    {
      key: "/billing",
      label: "Billing",
      resource: "billing",
      icon: React.createElement(FileOutlined),
    },
    {
      key: "/worklogs-all",
      label: "Worklogs",
      resource: "worklogs",
      icon: React.createElement(UserOutlined),
    },
    {
      key: "/attendance",
      label: "Attendance",
      resource: "default", // Make attendance available to all authenticated users
      icon: React.createElement(ClockCircleOutlined),
    },
    {
      key: "/leave-management",
      label: "Leave",
      resource: "leave",
      icon: React.createElement(CalendarOutlined),
    },
    {
      key: "/notice-board",
      label: "Notice Board",
      resource: "default", // Make notice board available to all authenticated users
      icon: React.createElement(NotificationOutlined),
    },
    {
      key: "/todotask",
      label: "Todo Tasks",
      resource: "todo-task",
      icon: React.createElement(CheckSquareOutlined),
    },
    {
      key: "/role",
      label: "Roles",
      resource: "admin",
      icon: React.createElement(TeamOutlined),
    },
    {
      key: "/permission",
      label: "Permissions",
      resource: "admin",
      icon: React.createElement(SafetyOutlined),
    },
    {
      key: "/permission/assign",
      label: "Assign Permissions",
      resource: "admin",
      icon: React.createElement(SettingOutlined),
    },
    {
      key: "/client-reports",
      label: "Client Reports",
      resource: "client-reports",
      icon: React.createElement(FolderOpenOutlined),
    },
    {
      key: "/client-users",
      label: "Client Users",
      resource: "client-users",
      icon: React.createElement(SolutionOutlined),
    },
    // {
    //   key: "/reports",
    //   label: "Reports",
    //   resource: "reports",
    //   icon: React.createElement(UserOutlined),
    // },
  ]

  const filteredItems = _.filter(items, item => {
    // Always show attendance for authenticated users
    if (item.resource === "default") {
      return true;
    }
    // For other items, use the original logic
    return _.some(permissions, { resource: item.resource });
  });

  return filteredItems
};
