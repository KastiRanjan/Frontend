import RequestTaskTable from "@/components/Task/RequestTaskTable";
import { Card } from "antd";


const Request = () => {
    return (
        <Card title="My Requests">
            <RequestTaskTable />
        </Card>
    );
};

export default Request;