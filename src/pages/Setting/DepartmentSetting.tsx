import React from "react";
import { Typography, Card } from "antd";
import DepartmentManager from "../../components/settings/DepartmentManager";

const { Title } = Typography;

const DepartmentSetting: React.FC = () => {
  return (
    <Card>
      <Title level={3}>Department Management</Title>
      <p className="mb-4">
        Create and manage departments for your organization. Departments can be assigned to users
        to better organize your team structure.
      </p>
      <DepartmentManager />
    </Card>
  );
};

export default DepartmentSetting;