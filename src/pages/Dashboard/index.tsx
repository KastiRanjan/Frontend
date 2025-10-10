import Notification from "@/components/Notification/Notification";
import { AttendanceDashboard, WorkingTimeDashboard } from "@/components/Dashboard";
import { canViewDashboardAttendance, canViewDashboardWorkingTime } from "@/utils/permissionHelpers";
import { useSession } from "@/context/SessionContext";
import { Card, Col, Row, Spin } from "antd";
import React, { Suspense } from "react";
import Analytic from "./Analytic";

const Dashboard: React.FC = () => {
  const { permissions } = useSession();
  const canViewAttendance = canViewDashboardAttendance(permissions || []);
  const canViewWorkingTime = canViewDashboardWorkingTime(permissions || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Row gutter={8}>
        <Col span={17} className="sticky top-0">
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

      {/* Attendance Dashboard - Only visible to users with permission */}
      {canViewAttendance && (
        <Row gutter={8}>
          <Col span={24}>
            <Suspense fallback={<Spin size="large" />}>
              <AttendanceDashboard />
            </Suspense>
          </Col>
        </Row>
      )}

      {/* Working Time Dashboard - Only visible to users with permission */}
      {canViewWorkingTime && (
        <Row gutter={8}>
          <Col span={24}>
            <Suspense fallback={<Spin size="large" />}>
              <WorkingTimeDashboard />
            </Suspense>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;