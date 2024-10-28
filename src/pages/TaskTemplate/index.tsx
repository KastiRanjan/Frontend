import PageTitle from "@/components/PageTitle";
import MoveTemplateModal from "@/components/TaskTemplate/MoveTemplateModal";
import TaskTemplateTable from "@/components/TaskTemplate/TaskTemplateTable";
import { Button } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TaskTemplate {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
}

const TaskTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRowSelected, setIsRowSelected] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <PageTitle
        title="Task Template"
        element={
          <div className="flex gap-4">
            <Button
              type="primary"
              onClick={() => navigate("/task-template/new")}
            >
              Create
            </Button>
            {isRowSelected && (
              <div>
                <Button type="primary" onClick={showModal}>
                  Add to Project
                </Button>
                <Button type="primary">Delete</Button>
              </div>
            )}
          </div>
        }
      />
      <TaskTemplateTable
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        setIsRowSelected={setIsRowSelected}
      />
    </>
  );
};

export default TaskTemplate;
