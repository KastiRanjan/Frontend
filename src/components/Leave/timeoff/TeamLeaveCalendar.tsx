import React, { useMemo, useState } from "react";
import { Button, Space, Skeleton, Alert } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLeaveCalendarViewByRange } from "../../../hooks/leave/useLeave";
import { useDateSystem } from "../../../context/DateSystemContext";
import { toBs } from "../../../utils/leaveDate";
import { DualDateConverter } from "../../../utils/dateConverter";
import { leaveColor } from "./leaveMeta";
import type { LeaveType } from "../../../types/leave";

const AD_DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BS_DOW = DualDateConverter.getDayNames().nepaliEn.map((d) => d.replace("bar", ""));
const BS_MONTHS = DualDateConverter.getMonthNames().nepaliEn;

interface DayEvent {
  name: string;
  color: string;
  pending: boolean;
}

const TeamLeaveCalendar: React.FC = () => {
  const { system } = useDateSystem();
  const [anchor, setAnchor] = useState(dayjs().startOf("month"));

  const from = anchor.startOf("month").format("YYYY-MM-DD");
  const to = anchor.endOf("month").format("YYYY-MM-DD");
  const { data, isLoading } = useLeaveCalendarViewByRange(from, to);

  const leaves: LeaveType[] = Array.isArray(data) ? data : [];

  // Map each AD day-of-month -> events overlapping it.
  const eventsByDay = useMemo(() => {
    const map: Record<number, DayEvent[]> = {};
    leaves.forEach((lv) => {
      const name = lv.leaveType?.name ?? lv.type;
      const color = leaveColor(name);
      const pending = lv.status !== "approved";
      const label = `${lv.user?.name?.split(" ")[0] ?? "?"} · ${name}`;
      const days: string[] =
        lv.isCustomDates && lv.customDates?.length
          ? lv.customDates
          : (() => {
              const out: string[] = [];
              let cur = dayjs(lv.startDate);
              const end = dayjs(lv.endDate);
              while (cur.isSame(end) || cur.isBefore(end)) {
                out.push(cur.format("YYYY-MM-DD"));
                cur = cur.add(1, "day");
              }
              return out;
            })();
      days.forEach((iso) => {
        const d = dayjs(iso);
        if (d.month() === anchor.month() && d.year() === anchor.year()) {
          (map[d.date()] ||= []).push({ name: label, color, pending });
        }
      });
    });
    return map;
  }, [leaves, anchor]);

  const daysInMonth = anchor.daysInMonth();
  const startPad = anchor.startOf("month").day(); // 0=Sun
  const today = dayjs();

  const headerBs = toBs(anchor.add(10, "day")); // mid-month → representative BS month
  const monthLabel =
    system === "BS"
      ? `${BS_MONTHS[headerBs.month - 1]} ${headerBs.year}`
      : anchor.format("MMMM YYYY");
  const subLabel =
    system === "BS"
      ? anchor.format("MMM YYYY")
      : `${BS_MONTHS[headerBs.month - 1]} ${headerBs.year}`;
  const dow = system === "BS" ? BS_DOW : AD_DOW;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push(<div key={`pad-${i}`} style={{ background: "var(--card-2, #fafcff)", minHeight: 92 }} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = anchor.date(d);
    const bs = toBs(date);
    const isSat = date.day() === 6;
    const isToday = date.isSame(today, "day");
    const primary = system === "BS" ? bs.day : d;
    const secondary = system === "BS" ? date.format("D MMM") : `${BS_MONTHS[bs.month - 1].slice(0, 3)} ${bs.day}`;
    cells.push(
      <div
        key={d}
        style={{
          background: isSat ? "rgba(235,47,150,0.05)" : "#fff",
          minHeight: 92,
          padding: "6px 7px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              ...(isToday
                ? {
                    background: "#1890ff",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "0 6px",
                    minWidth: 20,
                    textAlign: "center",
                  }
                : {}),
            }}
          >
            {primary}
          </span>
          <span style={{ fontSize: 10.5, color: "#8c9aa8" }}>{secondary}</span>
        </div>
        {(eventsByDay[d] || []).slice(0, 3).map((ev, i) => (
          <div
            key={i}
            title={ev.name}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...(ev.pending
                ? {
                    color: ev.color,
                    border: `1px dashed ${ev.color}`,
                    background: `${ev.color}14`,
                  }
                : { color: "#fff", background: ev.color }),
            }}
          >
            {ev.name}
          </div>
        ))}
        {(eventsByDay[d]?.length || 0) > 3 && (
          <span style={{ fontSize: 10.5, color: "#8c9aa8" }}>
            +{(eventsByDay[d]?.length || 0) - 3} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => setAnchor((a) => a.subtract(1, "month"))} />
          <div style={{ minWidth: 180, textAlign: "center" }}>
            <div style={{ fontWeight: 600 }}>{monthLabel}</div>
            <div style={{ fontSize: 12, color: "#8c9aa8" }}>{subLabel}</div>
          </div>
          <Button icon={<RightOutlined />} onClick={() => setAnchor((a) => a.add(1, "month"))} />
          <Button onClick={() => setAnchor(dayjs().startOf("month"))}>Today</Button>
        </Space>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            background: "#e8eef3",
            border: "1px solid #e8eef3",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {dow.map((d, i) => (
            <div
              key={d}
              style={{
                background: "#fafcff",
                padding: 8,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".03em",
                color: i === 6 ? "#eb2f96" : "#8c9aa8",
                textAlign: "center",
              }}
            >
              {d}
            </div>
          ))}
          {cells}
        </div>
      )}

      <Alert
        style={{ marginTop: 14 }}
        type="info"
        showIcon
        message="Solid = approved, dashed = awaiting approval. Saturday (शनिबार) is the weekly off."
      />
    </div>
  );
};

export default TeamLeaveCalendar;
