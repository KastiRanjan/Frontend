import { useCreateTaskGroup } from "@/hooks/taskGroup/useCreateTaskGroup";
import { useEditTaskGroup } from "@/hooks/taskGroup/useEditTaskGroup";
import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import FormInputWrapper from "../FormInputWrapper";
import { TaskGroup } from "@/pages/TaskGroup/type";
interface TaskGroupFormProps {
  editTaskGroupData?: TaskGroup;
  id?: string | undefined;
}

const TaskGroupForm = ({
  editTaskGroupData,
  id,
}: TaskGroupFormProps) => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useCreateTaskGroup();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditTaskGroup();

  useEffect(() => {
    if (id && editTaskGroupData) {
      form.setFieldsValue({
        ...editTaskGroupData,
      });
    } else {
      form.resetFields();
    }
  }, [editTaskGroupData, form, id]);

  const handleFinish = (values: any) => {
    id ? mutateEdit({ id, payload: values }) : mutate(values);
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
          <Button loading={isPending || isPendingEdit} type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TaskGroupForm;
