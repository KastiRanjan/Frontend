import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import { useCreateTaskTemplate } from "@/hooks/taskTemplate/useCreateTaskTemplate";
import { useEditTaskTemplate } from "@/hooks/taskTemplate/useEditTaskTemplate";
import { TaskTemplateType } from "@/types/taskTemplate";
import { Button, Col, Form, Input, Row } from "antd";
import { useParams } from "react-router-dom";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface TaskTemplateFormProps {
  editTaskTemplateData?: any;
  handleCancel: () => void;
}
const TaskTemplateForm = ({
  editTaskTemplateData,
  handleCancel,
}: TaskTemplateFormProps) => {
  const [form] = Form.useForm();
  const { id: gid } = useParams();
  const { data: taskgroup } = useTaskGroupById({ id: gid });
  const queryClient = useQueryClient();

  const { mutate } = useCreateTaskTemplate();
  const { mutate: mutateEdit } = useEditTaskTemplate();

  // Watch for changes to taskType
  const taskType = Form.useWatch('taskType', form);
  
  // Reset parentTaskId if taskType is "story"
  useEffect(() => {
    if (taskType === "story") {
      form.setFieldValue("parentTaskId", undefined);
    }
  }, [taskType, form]);

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      groupId: gid,
      // Ensure parentTaskId is set correctly for tasks
      parentTaskId: values.taskType === 'task' ? values.parentTaskId : undefined
    };
    
    console.log('Submitting task template:', payload);
    
    if (editTaskTemplateData?.id) {
      mutateEdit(
        { id: editTaskTemplateData?.id, payload: payload },
        {
          onSuccess: () => {
            handleCancel();
            queryClient.invalidateQueries({ queryKey: ["taskgroup", gid] });
          },
        }
      );
    } else {
      mutate(payload, { onSuccess: () => handleCancel() });
    }
  };
  console.log(form.getFieldValue("taskType"));

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={editTaskTemplateData}
      layout="vertical"
    >
      <Row gutter={16}>
        <Col span={24}>
          <FormInputWrapper
            id="name"
            name="name"
            label="Name"
            showCount={true}
            maxLength={100}
            placeholder="Enter task template name (max 100 characters)"
            rules={[
              { required: true, message: "Task template name is required" },
              { min: 1, message: "Task template name cannot be empty" },
              { max: 100, message: "Task template name cannot exceed 100 characters" }
            ]}
          />

          {/* Description (Optional) */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { type: "string", message: "Please input a valid description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <FormSelectWrapper
            id="taskType"
            name="taskType"
            label="Task Type"
            rules={[{ required: true, message: "Please select the task type" }]}
            options={[
              { value: "story", label: "Task" },
              { value: "task", label: "Subtask" },
            ]}
          />

          <FormSelectWrapper
            id="parentId"
            name="parentTaskId"
            label="Parent Task"
            disabled={taskType === "story"}
            showSearch={true}
            filterOption={(input: string, option: any) => 
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder={taskType === "story" ? "Not applicable for main tasks" : "Search and select a parent task"}
            rules={taskType === "task" ? [{ required: true, message: "Please select a parent task for this subtask" }] : []}
            options={
              taskgroup?.tasktemplate
                ?.filter((task: TaskTemplateType) => task.taskType === "story")
                ?.sort((a: TaskTemplateType, b: TaskTemplateType) => a.name.localeCompare(b.name))
                ?.map((template: TaskTemplateType) => ({
                  value: template.id,
                  label: template.name,
                })) || []
            }
          />

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TaskTemplateForm;
