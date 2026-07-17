import React from "react";
import { Row, Col, Card, Skeleton, Empty, Tooltip } from "antd";
import { useMyLeaveBalances } from "../../../hooks/useLeaveTypes";
import { leaveColor } from "./leaveMeta";
import type { LeaveBalance } from "../../../types/leave";

/** Horizontal stacked balance meter: taken (solid) + pending (striped) over an available track. */
const Meter: React.FC<{ used: number; pending: number; total: number; color: string }> = ({
  used,
  pending,
  total,
  color,
}) => {
  const pct = (n: number) => (total > 0 ? Math.min(100, (n / total) * 100) : 0);
  return (
    <div
      style={{
        display: "flex",
        height: 9,
        borderRadius: 6,
        overflow: "hidden",
        background: "rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ width: `${pct(used)}%`, background: color }} />
      <span
        style={{
          width: `${pct(pending)}%`,
          backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 3px, transparent 3px, transparent 6px)`,
          opacity: 0.85,
        }}
      />
    </div>
  );
};

const LegendItem: React.FC<{ swatch: React.CSSProperties; label: string }> = ({
  swatch,
  label,
}) => (
  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#8c9aa8" }}>
    <i style={{ width: 10, height: 10, borderRadius: 3, ...swatch }} />
    {label}
  </span>
);

const BalanceCard: React.FC<{ b: LeaveBalance }> = ({ b }) => {
  const name = b.leaveType?.name ?? "Leave";
  const color = leaveColor(name);
  const total = Number(b.totalAvailableDays) || 0;
  const used = Number(b.usedDays) || 0;
  const pending = Number(b.pendingDays) || 0;
  const remaining = Number(b.remainingDays) || 0;
  const carried = Number(b.carriedOverDays) || 0;

  return (
    <Card
      size="small"
      styles={{ body: { padding: 16 } }}
      style={{ borderLeft: `3px solid ${color}`, height: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</span>
        {b.leaveType?.isEmergency && (
          <Tooltip title="Can be requested same-day">
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".03em",
                padding: "2px 7px",
                borderRadius: 5,
                background: "rgba(250,84,28,.1)",
                color: "#fa541c",
              }}
            >
              Same-day
            </span>
          </Tooltip>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 680,
            letterSpacing: "-.02em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {remaining}
        </span>
        <span style={{ color: "#5c6b7a", fontSize: 13 }}>days left</span>
        <span style={{ marginLeft: "auto", color: "#8c9aa8", fontSize: 12.5 }}>
          of {total}
          {carried > 0 ? ` · +${carried} carried` : ""}
        </span>
      </div>

      <Meter used={used} pending={pending} total={total} color={color} />

      <div style={{ display: "flex", gap: 14, marginTop: 11, flexWrap: "wrap" }}>
        <LegendItem swatch={{ background: color }} label={`Taken ${used}`} />
        <LegendItem
          swatch={{
            backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, transparent 2px, transparent 4px)`,
            border: `1px solid ${color}`,
          }}
          label={`Pending ${pending}`}
        />
        <LegendItem
          swatch={{ background: "transparent", border: "1px solid #d6dee6" }}
          label={`Available ${remaining}`}
        />
      </div>
    </Card>
  );
};

const LeaveBalanceCards: React.FC<{ year?: number }> = ({ year }) => {
  const { data, isLoading } = useMyLeaveBalances(year);
  const balances: LeaveBalance[] = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <Row gutter={[14, 14]} style={{ marginBottom: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (!balances.length) {
    return <Empty description="No leave balance allocated yet" style={{ padding: 24 }} />;
  }

  return (
    <Row gutter={[14, 14]}>
      {balances.map((b) => (
        <Col key={b.leaveType?.id ?? b.leaveType?.name} xs={24} sm={12} lg={6}>
          <BalanceCard b={b} />
        </Col>
      ))}
    </Row>
  );
};

export default LeaveBalanceCards;
