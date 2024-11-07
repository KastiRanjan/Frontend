import { useSession } from "@/context/SessionContext";
import {
  ClusterOutlined,
  DashboardOutlined,
  FileOutlined,
  ProjectOutlined,
  UsergroupAddOutlined,
  UserOutlined
} from "@ant-design/icons";
import _ from "lodash";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const MenuItems = (): MenuItem[] => {
  const { permissions } = useSession()
  const items = [
    {
      key: "/",
      label: "Dashboard",
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
      key: "/tasks",
      label: "Quick Tasks",
      resource: "tasks",
      icon: React.createElement(UsergroupAddOutlined),
    },
    {
      key: "/task-template",
      label: "Task Template",
      resource: "task-template",
      icon: React.createElement(FileOutlined),
    },
    {
      key: "/task-group",
      label: "Task Group",
      resource: "task-group",
      icon: React.createElement(ClusterOutlined),
    },
    {
      key: "/client",
      label: "Client",
      resource: "client",
      icon: React.createElement(UserOutlined),
    },
    {
      key: "/worklogs-all",
      label: "Worklogs",
      resource: "worklogs",
      icon: React.createElement(UserOutlined),
    },
  ]

  const filteredItems = _.filter(items, item =>
    _.some(permissions, { resource: item.resource })
  );

  return filteredItems
};
