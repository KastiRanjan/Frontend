import { useCreateTaskGroup } from "@/hooks/taskGroup/useCreateTaskGroup";
import { useEditTaskGroup } from "@/hooks/taskGroup/useEditTaskGroup";
import { TaskGroup } from "@/pages/TaskGroup/type";
import { Button, Form, Input } from "antd";
import FormInputWrapper from "../FormInputWrapper";
interface TaskGroupFormProps {
  editTaskGroupData?: TaskGroup;
  id?: string | undefined;
  handleCancel: () => void;
}

const TaskGroupForm = ({
  handleCancel,
  editTaskGroupData,
}: TaskGroupFormProps) => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useCreateTaskGroup();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditTaskGroup();


  const handleFinish = (values: any) => {
    editTaskGroupData?.id ? mutateEdit({ id: editTaskGroupData?.id, payload: values }, { onSuccess: () => handleCancel() }) 
    : mutate(values, { onSuccess: () => handleCancel() });
  };
  return (
    <>
      <Form form={form} layout="vertical" initialValues={editTaskGroupData || {}} onFinish={handleFinish}>
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
