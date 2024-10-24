import PageTitle from "@/components/PageTitle";
import TaskTable from "@/components/Task/TaskTable";
import { useProjectById } from "@/hooks/project/useProjectById";
import { Button } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";


const Task: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data , isPending} = useProjectById({id: id?.toString()});
  console.log(data?.tasks)
  if(isPending) return <div>Loading...</div>
  
  return (
    <>
      <PageTitle title="Task"  
      element={
          <Button type="primary" onClick={() => navigate(`/project/${id}/tasks/new`)}>
            Add
          </Button> } />


        <TaskTable data={data?.tasks} />

    </>
  );
};

export default Task;
