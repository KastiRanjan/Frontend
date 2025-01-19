import PageTitle from "@/components/PageTitle";
import TaskTemplateTable from "@/components/TaskTemplate/TaskTemplateTable";
import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { Button, Card, Col, Modal, Row } from "antd";
import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TaskGroup } from "../TaskGroup/type";
import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import TaskTemplateForm from "@/components/TaskTemplate/TaskTemplatForm";
import { Task } from "../Project/type";
import { set } from "lodash";

interface TaskTemplate {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  taskType?: string
  description?: string;
}

const TaskTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRowSelected, setIsRowSelected] = useState(false);
  const { id } = useParams()
  const { data: taskGroup, isPending } = useTaskGroupById({ id });


  const [open, setOpen] = React.useState(false);
  const [editTaskTemplateData, setEditTaskTemplateData] = React.useState<Task | undefined>(undefined);

  const showModal = useCallback((task?: Task) => {
    setEditTaskTemplateData(task);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditTaskTemplateData(undefined);
    setOpen(false);
  }, []);

  return (
    <>
      {/* <PageTitle
        title={taskGroup?.name}
        description="Add, search, and manage your task templates all in one place."
      /> */}

      {open && (
        <Modal title="Add Task Template" footer={null} open={open} onCancel={handleCancel}>
          <TaskTemplateForm editTaskTemplateData={editTaskTemplateData} handleCancel={handleCancel} />
        </Modal>
      )}

      <TaskTemplateTable
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        setIsRowSelected={setIsRowSelected}
        taskList={taskGroup?.tasktemplate}
        isPending={isPending}
        showModal={showModal}
      />
    </>
  );
};

export default TaskTemplate;
