import Notification from "@/components/Notification/Notification";
import { AttendanceDashboard, WorkingTimeDashboard, UserAvailabilityDashboard } from "@/components/Dashboard";
import { canViewDashboardAttendance, canViewDashboardWorkingTime, canViewUserAvailability } from "@/utils/permissionHelpers";
import { useSession } from "@/context/SessionContext";
import { Card, Col, Row, Spin } from "antd";
import React, { Suspense } from "react";
import Analytic from "./Analytic";

const Dashboard: React.FC = () => {
  const { permissions } = useSession();
  const canViewAttendance = canViewDashboardAttendance(permissions || []);
  const canViewWorkingTime = canViewDashboardWorkingTime(permissions || []);
  const canViewAvailability = canViewUserAvailability(permissions || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "calc(100vh - 120px)" }}>
      <Row gutter={8} style={{ flex: "0 0 auto" }}>
        <Col span={17}>
          <Suspense fallback={<Spin size="large" />}>
            <Analytic />
          </Suspense>
        </Col>
        <Col span={7}>
          <Suspense fallback={<Spin size="large" />}>
            <Card 
              title="Notifications" 
              style={{ 
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
              bodyStyle={{
                flex: 1,
                overflow: "auto",
                maxHeight: "calc(100vh - 200px)"
              }}
            >
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

      {/* User Availability Dashboard - Only visible to users with permission */}
      {canViewAvailability && (
        <Row gutter={8}>
          <Col span={24}>
            <Suspense fallback={<Spin size="large" />}>
              <UserAvailabilityDashboard />
            </Suspense>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;