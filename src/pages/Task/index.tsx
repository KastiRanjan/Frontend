import PageTitle from "@/components/PageTitle";
import TaskForm from "@/components/Task/TaskForm";
import TaskTable from "@/components/Task/TaskTable";
import { useSession } from "@/context/SessionContext";
import { useProjectById } from "@/hooks/project/useProjectById";
import { useAddTaskProject } from "@/hooks/task/useAddTaskProject";
import { useProjectTask } from "@/hooks/task/useProjectTask";
import { useTaskTemplate } from "@/hooks/taskTemplate/useTaskTemplate";
import { checkPermissionForComponent } from "@/utils/permission";
import { Avatar, Button, Card, Checkbox, Form, List, Modal, Spin, Tooltip } from "antd";
import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Task as TaskType } from "../Project/type";

const Task = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { permissions } = useSession()
  const { data, isPending } = useProjectTask({ id });
  const { data: project } = useProjectById({ id })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [editTaskData, setEditTaskData] = React.useState<TaskType | undefined>(undefined);

  const showModal = useCallback((task?: TaskType) => {
    setEditTaskData(task);
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditTaskData(undefined);
    setOpen(false);
  }, []);

  if (isPending) return <Spin />

  return (
    <div>
      <PageTitle
        title={project?.name}
        description="Add, search, and manage your tasks all in one place."
      
      />

      <TaskTable data={data} showModal={showModal} project={project} />

      {open && (
        <Modal title="Add Task" footer={null} open={open} onCancel={handleCancel}>
          <div className="max-h-[70vh] overflow-y-scroll">
            <TaskForm editTaskData={editTaskData} users={project?.users} tasks={project?.tasks} handleCancel={handleCancel} />
          </div>
        </Modal>
      )}

    </div >
  );
};

export default Task;


const TaskImport = ({ isModalOpen, handleOk, handleCancel }: any) => {
  const { data } = useTaskTemplate()
  const [form] = Form.useForm();
  const { mutate } = useAddTaskProject();
  const { id } = useParams()
  const handleFinish = async (values: any) => {
    console.log(values)
    const payload = {
      project: id,
      tasks: values.tasks,
    };
    console.log(payload)
    await mutate(payload);
  };
  return (
    <Modal title="Task Template" open={isModalOpen} footer={null} onCancel={handleCancel}>
      <Form form={form} initialValues={{ tasks: [] }} onFinish={handleFinish}>

        <Form.Item name="tasks">
          <Checkbox.Group>
            <List
              dataSource={data}
              renderItem={(item: any) => (
                <List.Item>
                  <Checkbox value={{ ...item }}>{item.name}</Checkbox>
                </List.Item>
              )}
            />
          </Checkbox.Group>
        </Form.Item>
        <Button type="primary" htmlType="submit">Import</Button>
      </Form>
    </Modal >)
};