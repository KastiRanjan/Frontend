import PageTitle from "@/components/PageTitle";
import TaskTable from "@/components/Task/TaskTable";
import { useSession } from "@/context/SessionContext";
import { useProjectById } from "@/hooks/project/useProjectById";
import { useProjectTask } from "@/hooks/task/useProjectTask";
import { checkPermissionForComponent } from "@/utils/permission";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Spin, Tooltip } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Task: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { permissions } = useSession()
  const { data, isPending } = useProjectTask({ id });
  const { data: project } = useProjectById({ id })

  if (isPending) return <Spin />
  console.log(project)

  return (
    <div>
      <PageTitle
        title={project?.name}
        description="Add, search, and manage your tasks all in one place."
        element={
          <div className="flex gap-4">
            {checkPermissionForComponent(permissions, "project") && <Button
              type="primary"
              onClick={() => navigate(`/project/${id}/tasks/new`)}
            >
              Add New Task
            </Button>}
            <Avatar.Group
              max={{
                count: 4,
                style: {
                  color: "#f56a00",
                  backgroundColor: "#fde3cf",
                  cursor: "pointer",
                },
                popover: { trigger: "click" },
              }}
            >
              {project?.users?.map((user: any) => (
                <Tooltip title={user.username} placement="top">
                  <Avatar style={{ backgroundColor: "#87d068" }}>
                    {user.username.split("")[0]}
                  </Avatar>
                </Tooltip>
              ))}
            </Avatar.Group>
            <Tooltip title={project?.projectLead?.username} placement="top">
              <Avatar style={{ backgroundColor: "#87d068" }}>
                {project?.projectLead?.username.split("")[0]}
              </Avatar>
            </Tooltip>
          </div>
        }
      />

      <TaskTable data={data} />
    </div>
  );
};

export default Task;
