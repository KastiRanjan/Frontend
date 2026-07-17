import React, { useState } from "react";
import { Tabs, Button, Segmented, Card, Typography, Badge } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { DateSystemProvider, useDateSystem } from "../../context/DateSystemContext";
import { useSession } from "../../context/SessionContext";
import {
  getLeaveActionPermissions,
  canViewLeaveApprovals,
} from "../../utils/leavePermissions";
import { usePendingApprovals } from "../../hooks/leave/usePendingApprovals";
import LeaveBalanceCards from "../../components/Leave/timeoff/LeaveBalanceCards";
import MyRequestsTable from "../../components/Leave/timeoff/MyRequestsTable";
import ApprovalsInbox from "../../components/Leave/timeoff/ApprovalsInbox";
import TeamLeaveCalendar from "../../components/Leave/timeoff/TeamLeaveCalendar";
import NewRequestDrawer from "../../components/Leave/timeoff/NewRequestDrawer";

const { Title, Text } = Typography;

const TimeOffInner: React.FC = () => {
  const { system, setSystem } = useDateSystem();
  const { permissions } = useSession();
  const perms = getLeaveActionPermissions(permissions || []);
  const showApprovals = canViewLeaveApprovals(permissions || []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: pending } = usePendingApprovals();
  const pendingCount = Array.isArray(pending)
    ? pending.filter((l: any) => ["pending", "approved_by_manager"].includes(l.status)).length
    : 0;

  const items = [
    {
      key: "dashboard",
      label: "My Time Off",
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Title level={5} style={{ margin: 0 }}>
                Your balance
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Allocated resets each fiscal year
              </Text>
            </div>
            <LeaveBalanceCards />
          </div>
          <Card styles={{ body: { padding: 18 } }}>
            <Title level={5} style={{ marginTop: 0 }}>
              My requests
            </Title>
            <MyRequestsTable />
          </Card>
        </div>
      ),
    },
  ];

  if (showApprovals) {
    items.push({
      key: "approvals",
      label: (
        <span>
          Approvals{" "}
          {pendingCount > 0 && <Badge count={pendingCount} style={{ marginInlineStart: 4 }} />}
        </span>
      ) as any,
      children: <ApprovalsInbox />,
    });
  }

  if (perms.canViewCalendar) {
    items.push({
      key: "calendar",
      label: "Team Calendar",
      children: <TeamLeaveCalendar />,
    });
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Time Off <Text type="secondary" style={{ fontSize: 16 }}>· बिदा</Text>
          </Title>
          <Text type="secondary">
            Request leave, track your balance, and manage approvals.
          </Text>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Segmented
            value={system}
            onChange={(v) => setSystem(v as "AD" | "BS")}
            options={[
              { label: "BS · नेपाली", value: "BS" },
              { label: "AD", value: "AD" },
            ]}
          />
          {perms.canApply && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
              New Request
            </Button>
          )}
        </div>
      </div>

      <Tabs items={items} />
      <NewRequestDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

const TimeOff: React.FC = () => (
  <DateSystemProvider>
    <TimeOffInner />
  </DateSystemProvider>
);

export default TimeOff;
