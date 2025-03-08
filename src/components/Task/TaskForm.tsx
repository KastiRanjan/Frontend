import { Button, DatePicker, Form, message } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useCreateTask } from "@/hooks/task/useCreateTask";
import { useParams } from "react-router-dom";
import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import Paragraph from "antd/es/typography/Paragraph";
import { useProject } from "@/hooks/project/useProject";
import { useState } from "react";

const TaskForm = ({ users, tasks, editTaskData, handleCancel }: any) => {
  const [form] = Form.useForm();
  const { mutate, isPending } = useCreateTask();
  const { data: group } = useTaskGroup();
  const { id } = useParams();
  const { data: projects } = useProject({ status: "active" });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    editTaskData?.groupId || null
  );

  const onFinish = (values: any) => {
    values.projectId = id || values.projectId[0];
    mutate(values, {
      onSuccess: () => {
        message.success("Task saved successfully");
        handleCancel();
      },
      onError: (error: any) => {
        // Handle backend errors
        const errorMessage = error.response?.data?.message || 
          "Failed to save task. Please try again.";
        message.error(errorMessage);
        
        // If there are field-specific errors
        if (error.response?.data?.errors) {
          const fieldErrors = error.response.data.errors.map((err: any) => ({
            name: err.field,
            errors: [err.message],
          }));
          form.setFields(fieldErrors);
        }
      },
    });
  };

  // Filter parent tasks based on selected group
  const filteredParentTasks = tasks?.filter(
    (task: any) => !selectedGroupId || task.groupId === selectedGroupId
  ) || [];

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
    // Reset parentTaskId if it doesn't belong to the new group
    const currentParentId = form.getFieldValue("parentTaskId");
    if (
      currentParentId && 
      !filteredParentTasks.some((task: any) => task.id === currentParentId)
    ) {
      form.setFieldsValue({ parentTaskId: undefined });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={editTaskData || {}}
      onFinish={onFinish}
    >
      <Paragraph>Required fields are marked with an asterisk *</Paragraph>
      
      <FormInputWrapper
        id="name"
        label="Name"
        name="name"
        classname="w-[300px]"
        rules={[{ required: true, message: "Please input the task name!" }]}
      />

      <FormInputWrapper
        id="description"
        label="Description"
        name="description"
        classname="w-[300px]"
        rules={[
          { required: true, message: "Please input the task description!" },
        ]}
      />

      <FormSelectWrapper
        id="groupId"
        name="groupId"
        label="Group"
        classname="w-[300px]"
        options={
          group?.map((group: any) => ({
            value: group.id,
            label: group.name,
          })) || []
        }
        onChange={handleGroupChange}
      />

      <FormSelectWrapper
        id="parentTaskId"
        name="parentTaskId"
        label="Parent"
        options={
          filteredParentTasks.map((task: any) => ({
            value: task.id,
            label: task.name,
          })) || []
        }
      />

      <Form.Item
        name="dueDate"
        label="Due Date"
        rules={[{ required: true, message: "Please input the due date!" }]}
      >
        <DatePicker showTime format="YYYY-MM-DD" />
      </Form.Item>

      <FormSelectWrapper
        id="assineeId"
        name="assineeId"
        label="Assignee"
        mode="multiple"
        options={
          users?.map((user: any) => ({
            value: user.id,
            label: user.name,
          })) || []
        }
      />

      {!id && (
        <FormSelectWrapper
          id="projectId"
          name="projectId"
          label="Project"
          mode="multiple"
          options={
            projects?.map((project: any) => ({
              value: project.id,
              label: project.name,
            })) || []
          }
        />
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={isPending}
          loading={isPending}
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;