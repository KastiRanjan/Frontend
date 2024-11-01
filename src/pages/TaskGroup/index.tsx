import PageTitle from "@/components/PageTitle";
import TaskGroupTable from "@/components/TaskGroup/TaskGroupTable";
import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const TaskGroups: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Task Group"
        description="Add, search, and manage your task groups all in one place."
        element={
          <Button type="primary" onClick={() => navigate("/task-group/new")}>
            Create
          </Button>
        }
      />

      <TaskGroupTable />
    </>
  );
};

export default TaskGroups;
