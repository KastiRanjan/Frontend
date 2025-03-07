import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import IncomingWorklogTable from "@/components/Worklog/IncomingWorklogTable";
import { Tabs } from "antd";


const AllWorklogs = () => {
    return (
        <>
            <Tabs defaultActiveKey="1" items={[
                {
                    label: `Requested`,
                    key: "1",
                    children: <AllWorklogTable status="requested" />,
                },
                {
                    label: `Approved`,
                    key: "2",
                    children: <AllWorklogTable status="approved" />,
                },
                {
                    label: `Rejected`,
                    key: "3",
                    children: <AllWorklogTable status="rejected" />,
                },
                {
                    label: `Incoming Requests`,
                    key: "4",
                    children: <IncomingWorklogTable status="requested" />,
                },
                {
                    label: `Incoming Approved`,
                    key: "5",
                    children: <IncomingWorklogTable status="approved" />,
                },
                {
                    label: `Incoming Rejected`,
                    key: "6",
                    children: <IncomingWorklogTable status="rejected" />,
                },
            ]} />
        </> 
    );
};

export default AllWorklogs;