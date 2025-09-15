import { useAttendence } from "@/hooks/attendence/useAttendence";
import { useAllUsersAttendence } from "@/hooks/attendence/useAllUsersAttendence";
import { useTodayAllUsersAttendence } from "@/hooks/attendence/useTodayAllUsersAttendence";
import { useAttendenceById } from "@/hooks/attendence/useAttendenceById";
import { Table, Button, Input, Space, Tooltip } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import moment from "moment";
import { useState, useRef } from "react";
import Highlighter from 'react-highlight-words';

interface AttendenceTableProps {
  viewType?: 'my' | 'all-users' | 'today-all' | 'by-user' | 'date-wise';
  selectedUserId?: string;
  selectedDate?: string;
  dateWiseData?: any[];
  isPending?: boolean;
}

const AttendenceTable = ({ 
  viewType = 'my', 
  selectedUserId,
  selectedDate,
  dateWiseData,
  isPending: externalPending
}: AttendenceTableProps) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({
    order: 'descend',
    columnKey: 'date',
  });
  const searchInput = useRef<any>(null);

  // Get attendance data and loading state from the custom hooks based on view type
  const { data: myAttendence, isPending: myAttendencePending } = useAttendence();
  const { data: allUsersAttendence, isPending: allUsersAttendencePending } = useAllUsersAttendence(
    viewType === 'all-users'
  );
  const { data: todayAllUsersAttendence, isPending: todayAllUsersAttendencePending } = useTodayAllUsersAttendence(
    viewType === 'today-all'
  );
  const { data: userAttendence, isPending: userAttendencePending } = useAttendenceById({
    id: viewType === 'by-user' && selectedUserId ? selectedUserId : '',
  });

  // Determine which data and loading state to use based on viewType
  const getAttendanceData = () => {
    switch (viewType) {
      case 'all-users':
        return { data: allUsersAttendence, loading: allUsersAttendencePending };
      case 'today-all':
        return { data: todayAllUsersAttendence, loading: todayAllUsersAttendencePending };
      case 'date-wise':
        return { data: dateWiseData, loading: externalPending || false };
      case 'by-user':
        return { data: userAttendence, loading: userAttendencePending };
      case 'my':
      default:
        return { data: myAttendence, loading: myAttendencePending };
    }
  };

  const { data: attendence, loading: isPending } = getAttendanceData();

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  // Function to calculate the duration between clockIn and clockOut
  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "N/A"; // Handle case where clockOut isn't set yet

    const clockInTime = moment(clockIn, "HH:mm:ss a"); // Parse HH:mm:ss a format
    const clockOutTime = moment(clockOut, "HH:mm:ss a"); // Parse HH:mm:ss a format

    // Calculate the difference in minutes
    const durationInMinutes = moment.duration(clockOutTime.diff(clockInTime)).asMinutes();

    // Convert minutes to hours and minutes
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.floor(durationInMinutes % 60);

    return `${hours}h ${minutes}m`;
  };

  // Function to open the location in Google Maps
  const openLocationInMap = (latitude: string, longitude: string) => {
    const googleMapsURL = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(googleMapsURL, "_blank");
  };

  // Function to get landmark name from coordinates (placeholder implementation)
  const getLandmarkName = (latitude: string, longitude: string) => {
    // This is a placeholder. In a real implementation, this would use a reverse geocoding service
    // to convert coordinates to an address or landmark name.
    // For now, it will return a formatted coordinate string
    return `${latitude}, ${longitude}`;
  };

  const getColumnSearchProps = (dataIndex: string, title: string): any => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : dataIndex === 'userName' && record.user
        ? (record.user.name || record.user.email || '').toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    // Conditionally show user column for all-users, today-all, and date-wise views
    ...(viewType === 'all-users' || viewType === 'today-all' || viewType === 'date-wise' ? [{
      title: "User",
      dataIndex: ["user", "name"],
      key: "userName",
      ...getColumnSearchProps('userName', 'User'),
      render: (_text: string, record: any) => record.user?.name || record.user?.email || "N/A",
    }] : []),
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a: any, b: any) => moment(a.date).unix() - moment(b.date).unix(),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      defaultSortOrder: 'descend',
      ...getColumnSearchProps('date', 'Date'),
    },
    {
      title: "Clock In",
      dataIndex: "clockIn",
      key: "clockIn",
      sorter: (a: any, b: any) => moment(a.clockIn, "HH:mm:ss a").unix() - moment(b.clockIn, "HH:mm:ss a").unix(),
      sortOrder: sortedInfo.columnKey === 'clockIn' && sortedInfo.order,
      ...getColumnSearchProps('clockIn', 'Clock In'),
    },
    {
      title: "Clock In Remark",
      dataIndex: "clockInRemark",
      key: "clockInRemark",
      ...getColumnSearchProps('clockInRemark', 'Clock In Remark'),
      render: (text: string) => text || "N/A", // Display "N/A" if no remark
    },
    {
      title: "Clock Out",
      dataIndex: "clockOut",
      key: "clockOut",
      sorter: (a: any, b: any) => {
        if (!a.clockOut) return -1;
        if (!b.clockOut) return 1;
        return moment(a.clockOut, "HH:mm:ss a").unix() - moment(b.clockOut, "HH:mm:ss a").unix();
      },
      sortOrder: sortedInfo.columnKey === 'clockOut' && sortedInfo.order,
      ...getColumnSearchProps('clockOut', 'Clock Out'),
    },
    {
      title: "Clock Out Remark",
      dataIndex: "clockOutRemark",
      key: "clockOutRemark",
      ...getColumnSearchProps('clockOutRemark', 'Clock Out Remark'),
      render: (text: string) => text || "N/A", // Display "N/A" if no remark
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      sorter: (a: any, b: any) => {
        // Convert duration strings to minutes for sorting
        const getMinutes = (duration: string) => {
          if (duration === 'N/A') return 0;
          const match = duration.match(/(\d+)h\s+(\d+)m/);
          if (!match) return 0;
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        };
        return getMinutes(a.duration) - getMinutes(b.duration);
      },
      sortOrder: sortedInfo.columnKey === 'duration' && sortedInfo.order,
    },
    {
      title: "Worklogs",
      key: "worklogs",
      render: (_: any, record: any) => {
        const worklogs = record.worklogs;
        if (!worklogs) return "No data";
        
        return (
          <div style={{ fontSize: '12px' }}>
            <div style={{ color: '#1890ff' }}>
              📋 Requested: {worklogs.requested?.hours || '0h 0m'}
            </div>
            <div style={{ color: '#52c41a' }}>
              ✅ Approved: {worklogs.approved?.hours || '0h 0m'}
            </div>
            <div style={{ color: '#ff4d4f' }}>
              ❌ Rejected: {worklogs.rejected?.hours || '0h 0m'}
            </div>
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: any) => {
        // Check if we have valid latitude and longitude
        const hasLocation = record.latitude && record.longitude && 
                           record.latitude !== 'null' && record.longitude !== 'null';
        
        if (!hasLocation) {
          return <span style={{ color: '#999' }}>N/A</span>;
        }

        return (
          <Tooltip title="View Clock-in Location on Map">
            <Button
              type="link"
              icon={<EnvironmentOutlined />}
              onClick={() => openLocationInMap(record.latitude, record.longitude)}
              size="small"
            >
              Show on Map
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  // Add a "duration" field and landmark field for attendance data
  const updatedAttendence = attendence?.map((item: any) => ({
    ...item,
    duration: calculateDuration(item.clockIn, item.clockOut),
    // Get landmark name from the API response or calculate it here
    landmarkName: item.landmarkName || getLandmarkName(item.latitude, item.longitude),
  }));

  // Expanded row render to show clock-out history and worklog details
  const expandedRowRender = (record: any) => {
    const historyColumns = [
      {
        title: "Clock Out",
        dataIndex: "clockOut",
        key: "clockOut",
      },
      {
        title: "Remark",
        dataIndex: "remark",
        key: "remark",
        render: (text: string) => text || "N/A",
      },
      {
        title: "Action",
        key: "action",
        render: (_: any, historyItem: any) => {
          // Check if we have valid latitude and longitude
          const hasLocation = historyItem.latitude && historyItem.longitude && 
                             historyItem.latitude !== 'null' && historyItem.longitude !== 'null';
          
          if (!hasLocation) {
            return <span style={{ color: '#999' }}>No location</span>;
          }

          return (
            <Tooltip title="View Clock-out Location on Map">
              <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={() => openLocationInMap(historyItem.latitude, historyItem.longitude)}
                size="small"
              >
                Show on Map
              </Button>
            </Tooltip>
          );
        },
      },
    ];

    const worklogColumns = [
      {
        title: "Task",
        dataIndex: ["task", "name"],
        key: "taskName",
        render: (_: string, worklog: any) => worklog.task?.name || "N/A",
      },
      {
        title: "Start Time",
        dataIndex: "startTime",
        key: "startTime",
        render: (text: string) => moment(text).format("HH:mm:ss a"),
      },
      {
        title: "End Time",
        dataIndex: "endTime",
        key: "endTime",
        render: (text: string) => moment(text).format("HH:mm:ss a"),
      },
      {
        title: "Duration",
        key: "worklogDuration",
        render: (_: any, worklog: any) => {
          const start = moment(worklog.startTime);
          const end = moment(worklog.endTime);
          const duration = moment.duration(end.diff(start));
          const hours = Math.floor(duration.asHours());
          const minutes = duration.minutes();
          return `${hours}h ${minutes}m`;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
          const colors: { [key: string]: string } = {
            requested: '#1890ff',
            approved: '#52c41a',
            rejected: '#ff4d4f'
          };
          return (
            <span style={{ color: colors[status] || '#666' }}>
              {status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
            </span>
          );
        },
      },
    ];

    // Add landmark name to history items
    const updatedHistory = record.history?.map((item: any) => ({
      ...item,
      landmarkName: item.landmarkName || getLandmarkName(item.latitude, item.longitude),
    }));

    // Get all worklogs for display
    const allWorklogs = record.worklogs ? [
      ...(record.worklogs.requested?.items || []),
      ...(record.worklogs.approved?.items || []),
      ...(record.worklogs.rejected?.items || [])
    ] : [];

    return (
      <div>
        {updatedHistory && updatedHistory.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4>Clock-out History</h4>
            <Table
              columns={historyColumns}
              dataSource={updatedHistory}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </div>
        )}
        
        {allWorklogs && allWorklogs.length > 0 && (
          <div>
            <h4>Worklog Details</h4>
            <Table
              columns={worklogColumns}
              dataSource={allWorklogs}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </div>
        )}
        
        {(!updatedHistory || updatedHistory.length === 0) && (!allWorklogs || allWorklogs.length === 0) && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            No additional details available
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-container">
      <Table
        loading={isPending}
        dataSource={updatedAttendence}
        columns={columns}
        size="middle"
        rowKey="id"
        bordered
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.history && record.history.length > 0,
        }}
        onChange={handleTableChange}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </div>
  );
};

export default AttendenceTable;