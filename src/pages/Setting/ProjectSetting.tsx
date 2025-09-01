import React from "react";
import { Card, Typography } from "antd";
import NatureOfWorkManager from "../../components/Project/NatureOfWorkManager";

const { Title } = Typography;

const ProjectSetting: React.FC = () => {
  return (
    <Card>
      <Title level={3}>Nature of Work Management</Title>
      <NatureOfWorkManager />
    </Card>
  );
};

export default ProjectSetting;
