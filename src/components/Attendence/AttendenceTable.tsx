import { useAttendence } from "@/hooks/attendence/useAttendence";
import { Table, Button } from "antd";
import moment from "moment";

const AttendenceTable = () => {
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Clock In",
      dataIndex: "clockIn",
      key: "clockIn",
    },
    {
      title: "Clock Out",
      dataIndex: "clockOut",
      key: "clockOut",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      key: "longitude",
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      key: "latitude",
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          onClick={() => openLocationInMap(record.latitude, record.longitude)}
        >
          View Location
        </Button>
      ),
    },
  ];

  // Get attendance data and loading state from the custom hook
  const { data: attendence, isPending } = useAttendence();
  console.log(attendence);

  // Function to calculate the duration between clockIn and clockOut
  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "N/A"; // Handle case where clockOut isn’t set yet

    const clockInTime = moment(clockIn,"HH:mm:ss a"); // Parse ISO timestamp
    const clockOutTime = moment(clockOut,"HH:mm:ss a"); // Parse ISO timestamp

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

  // Add a "duration" field and process attendance data
  const updatedAttendence = attendence?.map((item: any) => ({
    ...item,
    duration: calculateDuration(item.clockIn, item.clockOut),
  }));

  // Expanded row render to show clock-out history
  const expandedRowRender = (record: any) => {
    const historyColumns = [
      {
        title: "Clock Out",
        dataIndex: "clockOut",
        key: "clockOut",
        render: (text: string) => moment(text).format("hh:mm:ss a"),
      },
      {
        title: "Latitude",
        dataIndex: "latitude",
        key: "latitude",
      },
      {
        title: "Longitude",
        dataIndex: "longitude",
        key: "longitude",
      },
      {
        title: "Remark",
        dataIndex: "remark",
        key: "remark",
        render: (text: string) => text || "N/A",
      },
      {
        title: "Location",
        key: "location",
        render: (_: any, historyItem: any) => (
          <Button
            type="primary"
            onClick={() => openLocationInMap(historyItem.latitude, historyItem.longitude)}
          >
            View Location
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={historyColumns}
        dataSource={record.history}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  return (
    <Table
      loading={isPending}
      dataSource={updatedAttendence}
      columns={columns}
      size="small"
      rowKey="id"
      bordered
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.history && record.history.length > 0, 
      }}
    />
  );
};

export default AttendenceTable;