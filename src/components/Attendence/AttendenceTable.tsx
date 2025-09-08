import { useAttendence } from "@/hooks/attendence/useAttendence";
import { Table, Button, Input, Space, Tooltip } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import moment from "moment";
import { useState, useRef } from "react";
import Highlighter from 'react-highlight-words';

const AttendenceTable = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [sortedInfo, setSortedInfo] = useState<any>({
    order: 'descend',
    columnKey: 'date',
  });
  const searchInput = useRef<any>(null);

  // Get attendance data and loading state from the custom hook
  const { data: attendence, isPending } = useAttendence();

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
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
      title: "Location",
      dataIndex: "landmarkName",
      key: "landmarkName",
      ...getColumnSearchProps('landmarkName', 'Location'),
      render: (text: string, record: any) => text || `${record.latitude}, ${record.longitude}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Tooltip title="View on Map">
          <Button
            type="primary"
            icon={<EnvironmentOutlined />}
            onClick={() => openLocationInMap(record.latitude, record.longitude)}
          />
        </Tooltip>
      ),
    },
  ];

  // Add a "duration" field and landmark field for attendance data
  const updatedAttendence = attendence?.map((item: any) => ({
    ...item,
    duration: calculateDuration(item.clockIn, item.clockOut),
    // Get landmark name from the API response or calculate it here
    landmarkName: item.landmarkName || getLandmarkName(item.latitude, item.longitude),
  }));

  // Expanded row render to show clock-out history
  const expandedRowRender = (record: any) => {
    const historyColumns = [
      {
        title: "Clock Out",
        dataIndex: "clockOut",
        key: "clockOut",
      },
      {
        title: "Location",
        dataIndex: "landmarkName",
        key: "landmarkName",
        render: (text: string, historyItem: any) => 
          text || `${historyItem.latitude}, ${historyItem.longitude}`,
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
        render: (_: any, historyItem: any) => (
          <Tooltip title="View on Map">
            <Button
              type="primary"
              icon={<EnvironmentOutlined />}
              onClick={() => openLocationInMap(historyItem.latitude, historyItem.longitude)}
            />
          </Tooltip>
        ),
      },
    ];

    // Add landmark name to history items
    const updatedHistory = record.history?.map((item: any) => ({
      ...item,
      landmarkName: item.landmarkName || getLandmarkName(item.latitude, item.longitude),
    }));

    return (
      <Table
        columns={historyColumns}
        dataSource={updatedHistory}
        pagination={false}
        rowKey="id"
        size="small"
      />
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