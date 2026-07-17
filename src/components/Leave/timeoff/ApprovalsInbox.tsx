import React from "react";
import { Card, Avatar, Button, Space, Tag, Empty, Skeleton, Popconfirm, message } from "antd";
import { usePendingApprovals } from "../../../hooks/leave/usePendingApprovals";
import { useApproveLeave } from "../../../hooks/leave/useMyLeaves";
import { useRejectLeave } from "../../../hooks/leave/useLeave";
import { useDateSystem } from "../../../context/DateSystemContext";
import { formatLeaveRange, inclusiveDays } from "../../../utils/leaveDate";
import { leaveColor, statusMeta } from "./leaveMeta";
import type { LeaveType } from "../../../types/leave";

const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Fact: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".03em", color: "#8c9aa8" }}>
      {k}
    </span>
    <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{children}</span>
  </div>
);

const ApprovalsInbox: React.FC = () => {
  const { system } = useDateSystem();
  const { data, isLoading } = usePendingApprovals();
  const approve = useApproveLeave();
  const reject = useRejectLeave();

  const rows: LeaveType[] = Array.isArray(data) ? data : [];
  // Only requests that still need an action from the viewer.
  const actionable = rows.filter((r) =>
    ["pending", "approved_by_manager"].includes(r.status)
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
  if (!actionable.length)
    return <Empty description="Nothing waiting for your approval" style={{ padding: 32 }} />;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {actionable.map((r) => {
        const name = r.leaveType?.name ?? r.type;
        const days =
          r.isCustomDates && r.customDates?.length
            ? r.customDates.length
            : inclusiveDays(r.startDate, r.endDate);
        const m = statusMeta(r.status);
        return (
          <Card key={r.id} size="small" styles={{ body: { padding: 16 } }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <Space size={14} align="center" wrap>
                <Avatar style={{ background: leaveColor(name), flex: "0 0 auto" }}>
                  {initials(r.user?.name)}
                </Avatar>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 600 }}>
                    {r.user?.name}{" "}
                    <span style={{ color: "#8c9aa8", fontWeight: 400 }}>
                      · {r.user?.role?.name}
                    </span>
                  </span>
                  <Space size={6}>
                    <span
                      style={{ width: 8, height: 8, borderRadius: "50%", background: leaveColor(name) }}
                    />
                    {name} · {formatLeaveRange(r.startDate, r.endDate, system)}
                  </Space>
                </div>
                <Fact k="Duration">{days} day{days > 1 ? "s" : ""}</Fact>
                <Tag color={m.color}>{m.text}</Tag>
              </Space>

              <Space>
                <Popconfirm
                  title="Refuse this request?"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    reject.mutate(
                      { id: r.id, userId: "" },
                      {
                        onSuccess: () => message.success("Request refused"),
                        onError: (e: any) =>
                          message.error(e?.response?.data?.message || "Could not refuse"),
                      }
                    )
                  }
                >
                  <Button danger>Refuse</Button>
                </Popconfirm>
                <Button
                  type="primary"
                  loading={approve.isPending}
                  onClick={() =>
                    approve.mutate(
                      { id: r.id },
                      {
                        onSuccess: () => message.success("Request approved"),
                        onError: (e: any) =>
                          message.error(e?.response?.data?.message || "Could not approve"),
                      }
                    )
                  }
                >
                  Approve
                </Button>
              </Space>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ApprovalsInbox;
