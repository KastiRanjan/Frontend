import { useCreateTask } from "@/hooks/task/useCreateTask";
import { useEditTask } from "@/hooks/task/useEditTask";
import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { useProject } from "@/hooks/project/useProject";
import { Button, Col, DatePicker, Divider, Form, Row, message } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import TextArea from "antd/es/input/TextArea";
import { useState, useEffect } from "react";
import moment from "moment";
import { useParams } from "react-router-dom";

interface TaskFormProps {
  users: any[];
  tasks: any[];
  editTaskData?: any;
  handleCancel: () => void;
  projectId?: string;
}

const TaskForm = ({ users, tasks, editTaskData, handleCancel, projectId }: TaskFormProps) => {
  const [form] = Form.useForm();
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useEditTask();
  const { data: group } = useTaskGroup();
  const { id: paramId } = useParams();
  const { data: projects } = useProject({ status: "active" });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    editTaskData?.groupId || null
  );

  const isEditing = !!editTaskData;
  const isPending = isCreating || isUpdating;
  const projectIdToUse = projectId || paramId;

  useEffect(() => {
    if (isEditing && editTaskData) {
      const initialData = {
        name: editTaskData.name,
        description: editTaskData.description,
        group: editTaskData.group?.id,
        parentTaskId: editTaskData.parentTaskId,
        dueDate: editTaskData.dueDate ? moment(editTaskData.dueDate) : null,
        assignees: editTaskData.assignees?.map((user: any) => user.id) || [],
        projectId: editTaskData.projectId,
        status: editTaskData.status,
      };
      form.setFieldsValue(initialData);
      setSelectedGroupId(editTaskData.groupId || null);
    } else {
      // Reset form when not editing
      form.resetFields();
    }
  }, [editTaskData, form, isEditing]);

  const onFinish = (values: any) => {
    // Prepare task data with all fields, excluding id
    const taskData = {
      name: values.name,
      description: values.description,
      groupId: values.group,
      parentTaskId: values.parentTaskId,
      dueDate: values.dueDate,
      assineeId: values.assignees,
      projectId: projectIdToUse || values.projectId?.[0],
      status: values.status,
    };

    console.log("Task data to submit:", taskData);

    const mutation = isEditing ? updateTask : createTask;
    const successMessage = isEditing ? "Task updated successfully" : "Task saved successfully";

    mutation(
      isEditing ? { id: editTaskData.id, payload: taskData } : taskData,
      {
        onSuccess: (response) => {
          console.log("Mutation response:", response);
          message.success(successMessage);
          handleCancel();
          form.resetFields();
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            `Failed to ${isEditing ? "update" : "save"} task. Please try again.`;
          message.error(errorMessage);
          console.error("Mutation error:", error);
          if (error.response?.data?.errors) {
            const fieldErrors = error.response.data.errors.map((err: any) => ({
              name: err.field,
              errors: [err.message],
            }));
            form.setFields(fieldErrors);
          }
        },
      }
    );
  };

  const filteredParentTasks =
    tasks?.filter((task: any) => !selectedGroupId || task.groupId === selectedGroupId) || [];

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
    const currentParentId = form.getFieldValue("parentTaskId");
    if (currentParentId && !filteredParentTasks.some((task: any) => task.id === currentParentId)) {
      form.setFieldsValue({ parentTaskId: undefined });
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={18}>
        <Divider />
        <Col span={24}>
          <FormInputWrapper
            id="name"
            label="Task Name"
            name="name"
            rules={[{ required: true, message: "Please input the task name!" }]}
          />
        </Col>

        <Col span={24}>
          <Form.Item
            id="description"
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input the task description!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="group"
            name="group"
            label="Group"
            options={group?.map((g: any) => ({ value: g.id, label: g.name })) || []}
            onChange={handleGroupChange}
          />
        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="parentTaskId"
            name="parentTaskId"
            label="Parent Task"
            options={filteredParentTasks.map((task: any) => ({ value: task.id, label: task.name })) || []}
          />
        </Col>

        <Col span={12}>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please select the due date!" }]}
          >
            <DatePicker className="py-3 w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <FormSelectWrapper
            id="assignees"
            name="assignees"
            label="Assignees"
            mode="multiple"
            placeholder="Select users"
            options={users?.map((user: any) => ({ value: user.id, label: user.name })) || []}
            rules={[{ required: true, message: "Please select at least one assignee!" }]}
          />
        </Col>

        {!projectIdToUse && (
          <Col span={12}>
            <FormSelectWrapper
              id="projectId"
              name="projectId"
              label="Project"
              options={projects?.map((p: any) => ({ value: p.id, label: p.name })) || []}
              rules={[{ required: true, message: "Please select a project!" }]}
            />
          </Col>
        )}

        <Col span={12}>
          <FormSelectWrapper
            id="status"
            name="status"
            label="Status"
            options={[
              { value: "open", label: "Open" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
            rules={[{ required: true, message: "Please select a status!" }]}
          />
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={isPending} loading={isPending}>
          {isEditing ? "Update" : "Save"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;