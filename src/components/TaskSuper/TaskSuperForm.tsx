import { useCreateTaskSuper } from "@/hooks/taskSuper/useCreateTaskSuper";
import { useEditTaskSuper } from "@/hooks/taskSuper/useEditTaskSuper";
import { TaskSuperType } from "@/types/taskSuper";
import { Button, Form, Input, InputNumber } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { useEffect } from "react";

interface TaskSuperFormProps {
  editTaskSuperData?: TaskSuperType;
  id?: string | undefined;
  handleCancel: () => void;
}

const TaskSuperForm = ({
  handleCancel,
  editTaskSuperData,
}: TaskSuperFormProps) => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useCreateTaskSuper();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditTaskSuper();

  // Set form values when editTaskSuperData changes
  useEffect(() => {
    if (editTaskSuperData) {
      form.setFieldsValue({
        name: editTaskSuperData.name,
        description: editTaskSuperData.description,
        rank: editTaskSuperData.rank
      });
    }
  }, [editTaskSuperData, form]);

  const handleFinish = (values: any) => {
    // Ensure rank is a number
    const formattedValues = {
      ...values,
      rank: values.rank ? Number(values.rank) : 1
    };
    
    editTaskSuperData?.id 
      ? mutateEdit({ id: editTaskSuperData?.id, payload: formattedValues }, { onSuccess: () => handleCancel() }) 
      : mutate(formattedValues, { onSuccess: () => handleCancel() });
  };

  return (
    <>
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={editTaskSuperData || {}} 
        onFinish={handleFinish}
      >
        <FormInputWrapper
          id="Task Super Name"
          label="Task Super Name"
          name="name"
          rules={[
            { required: true, message: "Please enter the task super name" },
          ]}
        />
        
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        
        <Form.Item
          label="Rank"
          name="rank"
          rules={[{ required: true, message: "Please enter a rank" }]}
        >
          <InputNumber min={1} />
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

export default TaskSuperForm;