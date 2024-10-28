import PageTitle from "@/components/PageTitle";
import { Button } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import TaskForm from "@/components/Task/TaskForm";
import { useProjectById } from "@/hooks/project/useProjectById";

const NewTask: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);
  const { data, isPending } = useProjectById({ id: id?.toString() });
  if (isPending) return <div>Loading...</div>;

  return (
    <>
      <PageTitle
        title="Create new task"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />
      <TaskForm users={data?.users} tasks={data?.tasks} />
    </>
  );
};

export default NewTask;
