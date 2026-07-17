import React, { useState } from "react";
import { Table, Tag, Select, Space, Button, Popconfirm, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMyLeaves } from "../../../hooks/leave/useMyLeaves";
import { useDeleteLeave } from "../../../hooks/leave/useLeave";
import { useDateSystem } from "../../../context/DateSystemContext";
import { formatLeaveRange, formatLeaveDate, inclusiveDays } from "../../../utils/leaveDate";
import { leaveColor, statusMeta } from "./leaveMeta";
import type { LeaveType } from "../../../types/leave";

const MyRequestsTable: React.FC = () => {
  const { system } = useDateSystem();
  const [status, setStatus] = useState<string>("all");
  const { data, isLoading } = useMyLeaves(status);
  const del = useDeleteLeave();

  const rows: LeaveType[] = Array.isArray(data) ? data : [];

  const columns: ColumnsType<LeaveType> = [
    {
      title: "Type",
      dataIndex: "type",
      render: (_, r) => {
        const name = r.leaveType?.name ?? r.type;
        return (
          <Space size={8}>
            <span
              style={{ width: 8, height: 8, borderRadius: "50%", background: leaveColor(name) }}
            />
            {name}
          </Space>
        );
      },
    },
    {
      title: "Dates",
      render: (_, r) =>
        r.isCustomDates && r.customDates?.length
          ? `${r.customDates.length} days`
          : formatLeaveRange(r.startDate, r.endDate, system),
    },
    {
      title: "Days",
      align: "right",
      render: (_, r) =>
        r.isCustomDates && r.customDates?.length
          ? r.customDates.length
          : inclusiveDays(r.startDate, r.endDate),
    },
    {
      title: "Approver",
      render: (_, r) => r.requestedManager?.name ?? "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => {
        const m = statusMeta(s);
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "Requested",
      dataIndex: "createdAt",
      render: (d: string) => formatLeaveDate(d, system, false),
    },
    {
      title: "",
      align: "right",
      render: (_, r) =>
        r.status === "pending" || r.status === "approved_by_manager" ? (
          <Popconfirm
            title="Cancel this request?"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              del.mutate(r.id, {
                onSuccess: () => message.success("Request cancelled"),
                onError: (e: any) =>
                  message.error(e?.response?.data?.message || "Could not cancel"),
              })
            }
          >
            <Button type="link" danger size="small">
              Cancel
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        scroll={{ x: 720 }}
      />
    </div>
  );
};

export default MyRequestsTable;
