import Notification from "@/components/Notification/Notification";
import { Card, Col, Row, Spin } from "antd";
import React, { Suspense } from "react";
import Analytic from "./Analytic";

const Dashboard: React.FC = () => {

  return (
    <Row gutter={16}>
      <Col span={17}>
        <Suspense fallback={<Spin size="large" />}>
          <Analytic />
        </Suspense>
      </Col>
      <Col span={7}>
        <Suspense fallback={<Spin size="large" />}>
          <Card className="h-full overflow-y-auto" title="Notifications">
            <Notification />
          </Card>
        </Suspense>
      </Col>
    </Row>
  );
};

export default Dashboard;