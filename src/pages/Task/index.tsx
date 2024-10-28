import PageTitle from "@/components/PageTitle";
import TaskTable from "@/components/Task/TaskTable";
import { useProjectTask } from "@/hooks/task/useTask";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Spin, Tooltip } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Task: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending } = useProjectTask({ id: id?.toString() });

  if (isPending) return <Spin />;

  return (
    <div>
      <PageTitle
        title="Task"
        element={
          <div className="flex gap-4">
            <Button
              type="primary"
              onClick={() => navigate(`/project/${id}/tasks/new`)}
            >
              Add
            </Button>
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
              <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
              <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
              <Avatar style={{ backgroundColor: "#f56a00" }}>R</Avatar>
              <Avatar style={{ backgroundColor: "#f56a00" }}>J</Avatar>
              <Tooltip title="Ant User" placement="top">
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
              </Tooltip>
              <Avatar
                style={{ backgroundColor: "#1677ff" }}
                icon={<AntDesignOutlined />}
              />
            </Avatar.Group>
          </div>
        }
      />

      <TaskTable data={data} />
    </div>
  );
};

export default Task;
