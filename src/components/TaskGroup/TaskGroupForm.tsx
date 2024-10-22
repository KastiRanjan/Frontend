import { Button, Form, Input } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { useCreateTaskGroup } from "@/hooks/taskGroup/useCreateTaskGroup";

const TaskGroupForm: React.FC = () => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useCreateTaskGroup();

  const handleFinish = (values: any) => {
    console.log("Form values: ", values);
    mutate(values);
  };
  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <FormInputWrapper
          id="Task Group Name"
          label="Task Group Name"
          name="name"
          rules={[
            { required: true, message: "Please enter the task group name" },
          ]}
        />
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TaskGroupForm;
