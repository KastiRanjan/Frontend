import { useTaskGroup } from "@/hooks/taskGroup/useTaskGroup";
import { useCreateTaskTemplate } from "@/hooks/taskTemplate/useCreateTaskTemplate";
import { TaskGroup } from "@/pages/TaskGroup/type";
import { Button, Col, Form, Input, Row } from "antd";
import { useEffect } from "react";
import FormInputWrapper from "../FormInputWrapper";
import FormSelectWrapper from "../FormSelectWrapper";
import { useEditTaskTemplate } from "@/hooks/taskTemplate/useEditTaskTemplate";

interface TaskTemplateFormProps {
  editTaskTemplateData?: any;
  id?: number;
}
const TaskTemplateForm = ({
  editTaskTemplateData,
  id,
}: TaskTemplateFormProps) => {
  const [form] = Form.useForm();

  const { data: groups, isPending } = useTaskGroup();
  const { mutate } = useCreateTaskTemplate();
  const { mutate: mutateEdit } = useEditTaskTemplate();

  useEffect(() => {
    if (id && editTaskTemplateData) {
      form.setFieldsValue({
        ...editTaskTemplateData,
      });
    } else {
      form.resetFields();
    }
  }, [editTaskTemplateData, form, id]);

  const handleFinish = (values: any) => {
    id ? mutateEdit({ id, payload: values }) : mutate(values);
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Row gutter={16}>
        <Col span={10}>
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

          {/* Group ID */}
          <FormSelectWrapper
            id="groupId"
            name="groupId"
            label="Task group"
            rules={[{ required: true, message: "Please select the group ID" }]}
            options={
              groups?.map((group: TaskGroup) => ({
                value: group.id,
                label: group.name,
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
