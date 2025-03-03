import PageTitle from "@/components/PageTitle";
import MoveTemplateModal from "@/components/TaskTemplate/MoveTemplateModal";
import MoveTemplateModalList from "@/components/TaskTemplate/MoveTemplateModalList";
import TaskTemplateTable from "@/components/TaskTemplate/TaskTemplateTable";
import TaskTemplateForm from "@/components/TaskTemplate/TaskTemplatForm";
import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import { TaskType } from "@/types/task";
import { Button, Modal } from "antd";
import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface TaskTemplate {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  taskType?: string;
  description?: string;
}

const TaskTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isRowSelected, setIsRowSelected] = useState(false);
  const { id } = useParams();
  const [checkedRows, setCheckedRows] = useState<string[]>([]);

  console.log("hello",checkedRows)
  const { data: taskGroup, isPending } = useTaskGroupById({ id });

  const [open, setOpen] = React.useState(false);
  const [editTaskTemplateData, setEditTaskTemplateData] = React.useState<
    TaskType | undefined
  >(undefined);

  const showModal = useCallback((task?: TaskType) => {
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
      {isRowSelected && <Button  type="primary" onClick={() => setIsModalOpen1(true)} >Add Template</Button>}
      {open && (
        <Modal
          title="Add Task Template"
          footer={null}
          open={open}
          onCancel={handleCancel}
        >
          <TaskTemplateForm
            editTaskTemplateData={editTaskTemplateData}
            handleCancel={handleCancel}
          />
        </Modal>
      )}

      <TaskTemplateTable
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        setIsRowSelected={setIsRowSelected}
        setCheckedRows={setCheckedRows}
        taskList={taskGroup?.tasktemplate}
        isPending={isPending}
        showModal={showModal}
      />

{isModalOpen1 && (
        <MoveTemplateModalList
          selectedRow={checkedRows}
          handleCancel={() => setIsModalOpen1(false)}
          isModalOpen={isModalOpen1}
          groupId={id}
        />
      )}

    </>
  );
};

export default TaskTemplate;
