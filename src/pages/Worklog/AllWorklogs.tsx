import PageTitle from "@/components/PageTitle";
import AllWorklogTable from "@/components/Worklog/AllWorklogTable";
import { useWorklog } from "@/hooks/worklog/useWorklog";
import { Button, Tabs } from "antd";
import { useNavigate } from "react-router-dom";


const AllWorklogs = () => {
    const { isPending, data } = useWorklog();
    const navigate = useNavigate();
    return (
        <>
            <PageTitle title="All Worklogs" element={<Button type="primary" onClick={() => navigate("/worklogs/new")}>Create</Button>} />
            <Tabs defaultActiveKey="1" items={[
                {
                    label: `Pending`,
                    key: "1",
                    children: <AllWorklogTable data={data}  isPending={isPending} />,
                },
                {
                    label: `Approved`,
                    key: "2",
                    children: <></>,
                },
                {
                    label: `Rejected`,
                    key: "3",
                    children: <></>,
                },
            ]} />

        </>
    );
};

export default AllWorklogs;