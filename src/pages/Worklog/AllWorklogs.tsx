import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import { Tabs } from "antd";


const AllWorklogs = () => {
    return (
        <>
            {/* <PageTitle title="All Worklogs" /> */}
            <Tabs defaultActiveKey="1" items={[
                {
                    label: `Pending`,
                    key: "1",
                    children: <AllWorklogTable status="open" />,
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
                    label: `Requested`,
                    key: "4",
                    children: <AllWorklogTable status="requested" />,
                },
            ]} />

        </>
    );
};

export default AllWorklogs;