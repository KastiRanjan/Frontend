import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import { Tabs } from "antd";


const AllWorklogs = () => {
    return (
        <>
            <Tabs defaultActiveKey="2" items={[
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
            ]} />
        </>
    );
};

export default AllWorklogs;