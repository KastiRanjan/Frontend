import { useCreateTaskGroup } from "@/hooks/taskGroup/useCreateTaskGroup";
import { useEditTaskGroup } from "@/hooks/taskGroup/useEditTaskGroup";
import { useFetchTaskSupers } from "@/hooks/taskSuper/useFetchTaskSupers";
import { Button, Form, Input, InputNumber, Select } from "antd";
import FormInputWrapper from "../FormInputWrapper";
import { TaskGroupType } from "@/types/taskSuper";
import { useEffect } from "react";

interface TaskGroupFormProps {
  editTaskGroupData?: TaskGroupType;
  id?: string | undefined;
  handleCancel: () => void;
  fixedTaskSuperId?: string; // New prop for fixed taskSuperId
}

const TaskGroupForm = ({
  handleCancel,
  editTaskGroupData,
  fixedTaskSuperId,
}: TaskGroupFormProps) => {
  const [form] = Form.useForm();

  const { mutate, isPending } = useCreateTaskGroup();
  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditTaskGroup();
  const { data: taskSupers, isPending: isTaskSupersLoading } = useFetchTaskSupers();

  // Set the fixed taskSuperId in the form when available
  useEffect(() => {
    if (fixedTaskSuperId) {
      form.setFieldsValue({ taskSuperId: fixedTaskSuperId });
    }
  }, [fixedTaskSuperId, form]);

  const handleFinish = (values: any) => {
    // Ensure rank is a number and taskSuperId is a string
    const formattedValues = {
      ...values,
      rank: values.rank ? Number(values.rank) : 1,
      taskSuperId: (values.taskSuperId || fixedTaskSuperId) ? String(values.taskSuperId || fixedTaskSuperId) : undefined
    };
    
    editTaskGroupData?.id 
      ? mutateEdit({ id: editTaskGroupData?.id, payload: formattedValues }, { onSuccess: () => handleCancel() }) 
      : mutate(formattedValues, { onSuccess: () => handleCancel() });
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
        <Form.Item
          label="Rank"
          name="rank"
          rules={[{ required: true, message: "Please enter a rank" }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        {!fixedTaskSuperId && (
          <Form.Item
            label="Category"
            name="taskSuperId"
            rules={[{ required: true, message: "Please select a Category" }]}
          >
            <Select
              placeholder="Select a Category"
              loading={isTaskSupersLoading}
              options={taskSupers?.map((taskSuper: any) => ({
                label: taskSuper.name,
                value: taskSuper.id,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item>
          <Button loading={isPending || isPendingEdit} type="primary" htmlType="submit" className="mr-2">
            Save
          </Button>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TaskGroupForm;
