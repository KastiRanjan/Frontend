import React, { useState } from "react";
import { 
  Card, 
  Table, 
  DatePicker, 
  Select, 
  Typography, 
  Space, 
  Tag, 
  Divider, 
  Button, 
  Timeline, 
  Tooltip, 
  Badge, 
  Tabs,
  Empty,
  Drawer,
  Alert
} from "antd";
import { 
  DownloadOutlined, 
  HistoryOutlined, 
  UserOutlined
} from "@ant-design/icons";
import { useUserHistory, UserHistoryItem, HistoryActionType } from "@/hooks/user/useUserHistory";
import { useUserDetails } from "@/hooks/user/useUserDetails";
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

  // Format value changes for display with highlighting differences
  const formatValueChanges = (oldValue: string, newValue: string) => {
    // Handle empty values
    if (!oldValue && !newValue) return <span className="text-gray-400">(No changes)</span>;
    if (!oldValue) return <div className="text-green-600">{newValue} <Tag color="green">Added</Tag></div>;
    if (!newValue) return <div className="text-red-600">{oldValue} <Tag color="red">Removed</Tag></div>;
    
    try {
      // Try to parse as JSON for object comparison
      const oldObj = JSON.parse(oldValue);
      const newObj = JSON.parse(newValue);
      
      // If we get here, both are valid JSON objects
      return (
        <div>
          <Tabs type="card" size="small" items={[
            {
              key: 'comparison',
              label: 'Changes',
              children: (
                <Space direction="vertical" className="w-full">
                  {Object.keys({...oldObj, ...newObj}).map(key => {
                    // Value was removed
                    if (!(key in newObj)) {
                      return (
                        <div key={key}>
                          <Tag color="red">Removed</Tag> <strong>{key}:</strong> {JSON.stringify(oldObj[key])}
                        </div>
                      );
                    }
                    // Value was added
                    if (!(key in oldObj)) {
                      return (
                        <div key={key}>
                          <Tag color="green">Added</Tag> <strong>{key}:</strong> {JSON.stringify(newObj[key])}
                        </div>
                      );
                    }
                    // Value was changed
                    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                      return (
                        <div key={key}>
                          <Tag color="blue">Changed</Tag> <strong>{key}:</strong>
                          <div className="pl-4">
                            <div className="text-red-600">- {JSON.stringify(oldObj[key])}</div>
                            <div className="text-green-600">+ {JSON.stringify(newObj[key])}</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </Space>
              )
            },
            {
              key: 'before',
              label: 'Before',
              children: (
                <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-60 text-sm">
                  {JSON.stringify(oldObj, null, 2)}
                </pre>
              )
            },
            {
              key: 'after',
              label: 'After',
              children: (
                <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-60 text-sm">
                  {JSON.stringify(newObj, null, 2)}
                </pre>
              )
            }
          ]} />
        </div>
      );
    } catch (e) {
      // Not JSON objects, display as simple before/after with diff highlighting
      return (
        <div>
          {oldValue === newValue ? (
            <div>
              <span>{oldValue}</span>
              <Tag color="gray" className="ml-2">Unchanged</Tag>
            </div>
          ) : (
            <Space direction="vertical" className="w-full">
              <div>
                <Tag color="red">Old</Tag> {oldValue || '(empty)'}
              </div>
              <div>
                <Tag color="green">New</Tag> {newValue || '(empty)'}
              </div>
            </Space>
          )}
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

  // Fetch user details for display
  const { data: userData, isLoading: userLoading } = useUserDetails(id);
  
  // State for detail view drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UserHistoryItem | null>(null);
  
  // Group history data by date for timeline view
  const groupedByDate = historyData.reduce((acc: Record<string, UserHistoryItem[]>, item) => {
    const date = dayjs(item.createdAt).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
  
  // Generate CSV for export
  const exportToCSV = () => {
    if (!historyData.length) return;
    
    // Prepare CSV content
    const csvHeader = 'Date,Time,Action,Field,Old Value,New Value,Modified By,Description\n';
    const csvRows = historyData.map(item => {
      const date = dayjs(item.createdAt).format('YYYY-MM-DD');
      const time = dayjs(item.createdAt).format('HH:mm:ss');
      const action = actionTypeLabels[item.actionType];
      const field = item.field;
      const oldValue = `"${(item.oldValue || '').replace(/"/g, '""')}"`; // Escape quotes for CSV
      const newValue = `"${(item.newValue || '').replace(/"/g, '""')}"`; 
      const modifiedBy = item.modifiedBy?.name || 'System';
      const description = `"${(item.description || '').replace(/"/g, '""')}"`;
      
      return `${date},${time},${action},${field},${oldValue},${newValue},${modifiedBy},${description}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `user_history_${id}_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle record click for details
  const handleRecordClick = (record: UserHistoryItem) => {
    setSelectedRecord(record);
    setDetailDrawerOpen(true);
  };
  
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  
  return (
    <Card>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Space>
          <HistoryOutlined style={{ fontSize: '24px' }} />
          <Title level={4} style={{ margin: 0 }}>User History</Title>
        </Space>
        
        <Space>
          {historyData.length > 0 && (
            <Button 
              icon={<DownloadOutlined />} 
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          )}
          
          <Button.Group>
            <Button 
              type={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button 
              type={viewMode === 'timeline' ? 'primary' : 'default'}
              onClick={() => setViewMode('timeline')}
            >
              Timeline View
            </Button>
          </Button.Group>
        </Space>
      </div>
      
      {/* User info */}
      {!userLoading && userData && (
        <Alert
          type="info"
          showIcon
          icon={<UserOutlined />}
          message={
            <Space>
              <span>History for {userData.name}</span>
              <Tag>{userData.role?.name || 'User'}</Tag>
              <span style={{ color: '#666' }}>{userData.email}</span>
            </Space>
          }
          style={{ marginBottom: '16px' }}
        />
      )}
      
      {/* Filters Section */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space size="large" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <span style={{ marginRight: '8px' }}>Date Range:</span>
            <RangePicker onChange={handleDateRangeChange} />
          </div>
          
          <div style={{ minWidth: '300px' }}>
            <span style={{ marginRight: '8px' }}>Action Types:</span>
            <Select
              mode="multiple"
              placeholder="Filter by action type"
              style={{ width: '300px' }}
              onChange={handleActionTypeChange}
              allowClear
            >
              {Object.entries(actionTypeLabels).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>
      
      {isLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <span>Loading history...</span>
        </div>
      ) : historyData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No history records found"
        >
          <p style={{ color: '#666' }}>
            Try changing your filters or check back later when more actions have been recorded.
          </p>
        </Empty>
      ) : viewMode === 'table' ? (
        /* Table View */
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="id"
          loading={isLoading}
          onRow={(record) => ({
            onClick: () => handleRecordClick(record)
          })}
          rowClassName="cursor-pointer hover:bg-gray-50"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} records`,
          }}
        />
      ) : (
        /* Timeline View */
        <div className="timeline-container" style={{ padding: '20px 0' }}>
          <Timeline
            mode="left"
            items={Object.entries(groupedByDate).map(([date, items]) => {
              const formattedDate = dayjs(date).format('MMM DD, YYYY');
              const itemCount = items.length;
              
              return {
                children: (
                  <div key={date} className="timeline-day">
                    <Divider orientation="left">
                      <Badge count={itemCount} showZero={false} overflowCount={99} style={{ backgroundColor: '#1890ff' }}>
                        <span style={{ padding: '0 8px' }}>{formattedDate}</span>
                      </Badge>
                    </Divider>
                    
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="timeline-item"
                        onClick={() => handleRecordClick(item)}
                        style={{ cursor: 'pointer', padding: '8px', margin: '8px 0', borderRadius: '4px' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <Tag color={actionTypeColors[item.actionType]}>{actionTypeLabels[item.actionType]}</Tag>
                          <span style={{ marginLeft: '8px', color: '#666' }}>
                            {dayjs(item.createdAt).format('HH:mm')}
                          </span>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Field:</strong> {item.field}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ marginTop: '4px', fontSize: '12px' }}>
                          <em>Modified by {item.modifiedBy?.name || 'System'}</em>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              };
            })}
          />
        </div>
      )}
      
      {/* Detail Drawer */}
      <Drawer
        title="History Record Details"
        placement="right"
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
        width={600}
      >
        {selectedRecord && (
          <div className="record-details">
            <div style={{ marginBottom: '16px' }}>
              <Tag color={actionTypeColors[selectedRecord.actionType]} style={{ fontSize: '14px' }}>
                {actionTypeLabels[selectedRecord.actionType]}
              </Tag>
              <div style={{ marginTop: '8px' }}>
                <strong>Date & Time:</strong> {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            
            <Divider orientation="left">Details</Divider>
            
            <div style={{ marginBottom: '16px' }}>
              <p>
                <strong>Field:</strong> {selectedRecord.field}
              </p>
              {selectedRecord.description && (
                <p>
                  <strong>Description:</strong> {selectedRecord.description}
                </p>
              )}
              <p>
                <strong>Modified By:</strong> {selectedRecord.modifiedBy?.name || 'System'}
              </p>
            </div>
            
            <Divider orientation="left">Changes</Divider>
            
            <div className="changes-section">
              {formatValueChanges(selectedRecord.oldValue, selectedRecord.newValue)}
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default UserHistoryDetails;