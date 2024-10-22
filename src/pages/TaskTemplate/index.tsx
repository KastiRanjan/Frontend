// src/components/TaskTemplate.tsx

import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import axios from "axios";
import PageTitle from "@/components/PageTitle";
import { useNavigate } from "react-router-dom";
import TaskTemplateTable from "@/components/TaskTemplate/TaskTemplateTable";

interface TaskTemplate {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
}

const TaskTemplate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageTitle
        title="Task Template"
        element={
          <Button type="primary" onClick={() => navigate("/task-template/new")}>
            Create
          </Button>
        }
      />
      <TaskTemplateTable />
    </>
  );
};

export default TaskTemplate;
