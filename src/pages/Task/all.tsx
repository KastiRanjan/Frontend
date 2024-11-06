import PageTitle from "@/components/PageTitle";
import AllTaskTable from "@/components/Task/AllTaskTable";
import TaskTable from "@/components/Task/TaskTable";
import { useTask } from "@/hooks/task/useTask";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Spin, Tooltip } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const AllTask: React.FC = () => {
    const navigate = useNavigate();
    const { data, isPending } = useTask();

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
                            onClick={() => navigate(`/project/${id}/tasks/new`)}
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
