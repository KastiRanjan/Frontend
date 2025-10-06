import React, { useState } from "react";
import { Card, Table, DatePicker, Select, Typography, Space, Tag } from "antd";
import { useUserHistory, UserHistoryItem, HistoryActionType } from "@/hooks/user/useUserHistory";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Map for human-readable action type labels
const actionTypeLabels: Record<HistoryActionType, string> = {
  [HistoryActionType.ROLE_CHANGE]: "Role Change",
  [HistoryActionType.PROFILE_UPDATE]: "Profile Update",
  [HistoryActionType.DEPARTMENT_CHANGE]: "Department Change",
  [HistoryActionType.LEAVE_BALANCE_UPDATE]: "Leave Balance Update",
  [HistoryActionType.CONTRACT_UPDATE]: "Contract Update",
  [HistoryActionType.STATUS_CHANGE]: "Status Change",
  [HistoryActionType.VERIFICATION]: "Verification",
  [HistoryActionType.OTHER]: "Other"
};

// Map for action type colors
const actionTypeColors: Record<HistoryActionType, string> = {
  [HistoryActionType.ROLE_CHANGE]: "blue",
  [HistoryActionType.PROFILE_UPDATE]: "green",
  [HistoryActionType.DEPARTMENT_CHANGE]: "orange",
  [HistoryActionType.LEAVE_BALANCE_UPDATE]: "purple",
  [HistoryActionType.CONTRACT_UPDATE]: "cyan",
  [HistoryActionType.STATUS_CHANGE]: "red",
  [HistoryActionType.VERIFICATION]: "geekblue",
  [HistoryActionType.OTHER]: "default"
};

const UserHistoryDetails: React.FC = () => {
  const { id } = useParams();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedActionTypes, setSelectedActionTypes] = useState<HistoryActionType[]>([]);

  // Format query parameters for the API call
  const queryParams = {
    actionType: selectedActionTypes.length > 0 ? selectedActionTypes.join(',') : undefined,
    startDate: dateRange?.[0]?.format('YYYY-MM-DD') || undefined,
    endDate: dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
  };

  // Fetch history data
  const { data: historyData = [], isLoading } = useUserHistory(id, queryParams);

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
  };

  // Handle action type selection change
  const handleActionTypeChange = (values: HistoryActionType[]) => {
    setSelectedActionTypes(values);
  };

  // Format value changes for display
  const formatValueChanges = (oldValue: string, newValue: string) => {
    try {
      // Try to parse as JSON for object comparison
      const oldObj = JSON.parse(oldValue);
      const newObj = JSON.parse(newValue);
      
      // If we get here, both are valid JSON objects
      return (
        <div>
          <div>
            <strong>Old:</strong> <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
              {JSON.stringify(oldObj, null, 2)}
            </pre>
          </div>
          <div className="mt-2">
            <strong>New:</strong> <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
              {JSON.stringify(newObj, null, 2)}
            </pre>
          </div>
        </div>
      );
    } catch (e) {
      // Not JSON objects, display as simple before/after
      return (
        <div>
          <div><strong>From:</strong> {oldValue || '(empty)'}</div>
          <div><strong>To:</strong> {newValue || '(empty)'}</div>
        </div>
      );
    }
  };

  // Define columns with proper type
  const columns: ColumnsType<UserHistoryItem> = [
    {
      title: "Date/Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Action",
      dataIndex: "actionType",
      key: "actionType",
      width: 150,
      render: (text: HistoryActionType) => (
        <Tag color={actionTypeColors[text] || "default"}>
          {actionTypeLabels[text] || text}
        </Tag>
      ),
    },
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: 150,
    },
    {
      title: "Changes",
      key: "changes",
      render: (_: unknown, record: UserHistoryItem) => formatValueChanges(record.oldValue, record.newValue),
    },
    {
      title: "Modified By",
      key: "modifiedBy",
      width: 200,
      render: (_: unknown, record: UserHistoryItem) => record.modifiedBy?.name || 'System',
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "-",
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>User History</Title>
        <Space size="large">
          <RangePicker onChange={handleDateRangeChange} />
          <Select
            mode="multiple"
            placeholder="Filter by action type"
            style={{ width: 300 }}
            onChange={handleActionTypeChange}
            allowClear
          >
            {Object.entries(actionTypeLabels).map(([value, label]) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={historyData}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} records`,
        }}
      />
    </Card>
  );
};

export default UserHistoryDetails;