import AllTaskTable from "@/components/Task/AllTaskTable";
import { useTasks } from "@/hooks/task/useTask";
import { Spin, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const AllTask = () => {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { data, isPending } = useTasks();


    if (isPending) return <Spin />;

    return (
        <div>
            <Tabs defaultActiveKey="1" items={[
                {
                    label: `TODO`,
                    key: "1",
                    children: <AllTaskTable data={data} />,
                },
                {
                    label: `DOING`,
                    key: "2",
                    children: <AllTaskTable data={data} />,
                },
                {
                    label: `COMPLETED`,
                    key: "3",
                    children: <AllTaskTable data={data} />,
                },
            ]}
            />
        </div>
    );
};

export default AllTask;
