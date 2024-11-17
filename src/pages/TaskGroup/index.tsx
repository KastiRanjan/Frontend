import PageTitle from "@/components/PageTitle";
import TaskGroupForm from "@/components/TaskGroup/TaskGroupForm";
import TaskGroupList from "@/components/TaskGroup/TaskGroupList";
import { Modal } from "antd";
import React, { useCallback } from "react";
import { TaskGroup } from "./type";


const TaskGroups: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [editTaskGroupData, setEditTaskGroupData] = React.useState<TaskGroup | undefined>(undefined);

  const showModal = useCallback((taskGroup?: TaskGroup) => {
    setEditTaskGroupData(taskGroup);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditTaskGroupData(undefined);
    setOpen(false);
  }, []);

  return (
    <>
      <PageTitle
        title="Task Template"
      />

      <TaskGroupList showModal={showModal} />

      {open && (
        <Modal title="Add Task Template" footer={null} open={open} onCancel={handleCancel}>
          <TaskGroupForm editTaskGroupData={editTaskGroupData} handleCancel={handleCancel} />
        </Modal>
      )}
    </>
  );
};

export default TaskGroups;
