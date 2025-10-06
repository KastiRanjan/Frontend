import {
  DashboardOutlined,
  FileOutlined,
  ProjectOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import React from "react";

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export const UserMenu = (id: string | undefined) => {
  return [
    {
      key: `/profile/${id}/personal-detail`,
      label: "Personal Details",
      icon: React.createElement(DashboardOutlined),
    },
    {
      key: `/profile/${id}/educational-detail`,
      label: "Educational Details",
      icon: React.createElement(UsergroupAddOutlined),
    },
    {
      key: `/profile/${id}/bank-detail`,
      label: "Bank Details",
      icon: React.createElement(ProjectOutlined),
    },
    {
      key: `/profile/${id}/training-detail`,
      label: "Training",
      icon: React.createElement(FileOutlined),
    },
    {
      key: `/profile/${id}/workhour-detail`,
      label: "Work Hours",
      icon: React.createElement(ClockCircleOutlined),
    },
    {
      key: `/profile/${id}/leave-detail`,
      label: "Leave",
      icon: React.createElement(CalendarOutlined),
    },
    {
      key: `/profile/${id}/contract-detail`,
      label: "Contract Details",
      icon: React.createElement(FileOutlined),
    },
    {
      key: `/profile/${id}/document-detail`,
      label: "Personal Documents",
      icon: React.createElement(FileOutlined),
    },
    {
      key: `/profile/${id}/history`,
      label: "User History",
      icon: React.createElement(HistoryOutlined),
    },
  ]
};

