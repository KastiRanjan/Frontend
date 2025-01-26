import { useTaskGroupById } from "@/hooks/taskGroup/useTaskGroupById";
import { useCreateTaskTemplate } from "@/hooks/taskTemplate/useCreateTaskTemplate";
import { useEditTaskTemplate } from "@/hooks/taskTemplate/useEditTaskTemplate";
import TaskTemplate from "@/pages/TaskTemplate";
import { Button, Col, Form, Input, Row } from "antd";
import { useParams } from "react-router-dom";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useQueryClient } from "@tanstack/react-query";

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

  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      groupId: gid,
    };
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
            rules={[{ required: true, message: "Please input the name" }]}
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
            label="Epic"
            rules={[{ required: true, message: "Please select the group ID" }]}
            options={
              [
                { value: "story", label: "Story" },
                { value: "task", label: "Task" },
              ]?.map((group) => ({
                value: group.value,
                label: group.label,
              })) || []
            }
          />

          <FormSelectWrapper
            id="parentId"
            name="parentTaskId"
            label="Parent Task"
            disabled={form.getFieldValue("taskType") == "Story"}
            options={
              taskgroup?.tasktemplate
                ?.filter((task: TaskTemplate) => task.taskType == "story")
                ?.map((template: TaskTemplate) => ({
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
