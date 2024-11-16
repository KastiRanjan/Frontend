import { useCreateUser } from "@/hooks/user/userCreateuser";
import { Button, Form } from "antd";
import UserAuthDetail from "./UserAuthDetail";
import { UserType } from "@/hooks/user/type";

const UserForm = ({ initialValues }: { initialValues?: UserType }) => {
  const [form] = Form.useForm();
  const { mutate } = useCreateUser();

  const handleFinish = (values: any) => {
    mutate(values);
  };
  return (
    <div>
      <Form form={form} initialValues={initialValues} layout="vertical" onFinish={handleFinish}>
        <UserAuthDetail />
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
