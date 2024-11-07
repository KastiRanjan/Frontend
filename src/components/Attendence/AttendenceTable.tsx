import { useAttendence } from "@/hooks/attendence/useAttendence";
import { Table, Button } from "antd";
import moment from "moment"; // Optional: for easier time manipulation

const AttendenceTable = () => {

    // Columns definition for the table
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

    // Function to calculate the duration between clockIn and clockOut
    const calculateDuration = (clockIn: string, clockOut: string) => {
        const clockInTime = moment(clockIn, "HH:mm:ss a"); // Parse with moment
        const clockOutTime = moment(clockOut, "HH:mm:ss a");

        // Calculate the difference in minutes
        const durationInMinutes = moment.duration(clockOutTime.diff(clockInTime)).asMinutes();

        // Convert minutes to hours and minutes
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = Math.floor(durationInMinutes % 60);

        return `${hours}h ${minutes}m`;
    };

    // Function to open the location in Google Maps
    const openLocationInMap = (latitude: number, longitude: number) => {
        const googleMapsURL = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(googleMapsURL, "_blank"); // Open the map in a new tab
    };

    // Add a "duration" field to each attendance entry
    const updatedAttendence = attendence?.map((item: any) => ({
        ...item,
        duration: calculateDuration(item.clockIn, item.clockOut),
    }));

    return (
        <Table
            loading={isPending}
            dataSource={updatedAttendence}
            columns={columns}
            size="small"
            rowKey={"id"}
            bordered
        />
    );
};

export default AttendenceTable;
