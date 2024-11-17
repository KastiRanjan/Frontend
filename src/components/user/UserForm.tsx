import { useCreateUser } from "@/hooks/user/userCreateuser";
import { Button, Form } from "antd";
import UserAuthDetail from "./UserAuthDetail";
import { UserType } from "@/hooks/user/type";

const UserForm = ({ initialValues, handleCancel }: { initialValues?: UserType, handleCancel?: any }) => {
  const [form] = Form.useForm();
  const { mutate } = useCreateUser();

  const handleFinish = (values: any) => {
    mutate(values, { onSuccess: () => handleCancel() });

  };
  return (
    <div>
      <Form form={form} initialValues={{ ...initialValues, role: { value: initialValues?.role?.id, label: initialValues?.role?.name } }} layout="vertical" onFinish={handleFinish}>
        <UserAuthDetail initialValues={initialValues} />
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
