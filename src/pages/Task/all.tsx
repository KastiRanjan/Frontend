import PageTitle from "@/components/PageTitle";
import AllTaskTable from "@/components/Task/AllTaskTable";
import { useProjectTask } from "@/hooks/task/useProjectTask";
import { Button, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const AllTask = () => {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { data, isPending } = useProjectTask({ id: pid });

    if (isPending) return <Spin />;

    return (
        <div>
            <PageTitle
                title="Task"
                description="Add, search, and manage your tasks all in one place."
                element={
                    <div className="flex gap-4">
                        <Button
                            type="primary"
                            onClick={() => navigate(`/project/${pid}/tasks/new`)}
                        >
                            Add
                        </Button>
                    </div>
                }
            />

            <AllTaskTable data={data} />
        </div>
    );
};

export default AllTask;
