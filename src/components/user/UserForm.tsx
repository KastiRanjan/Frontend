import { useCreateUser } from "@/hooks/user/userCreateuser";
import { Button, Form } from "antd";
import UserAuthDetail from "./UserAuthDetail";

const UserForm = () => {
  const [form] = Form.useForm();
  const { mutate } = useCreateUser();

  const handleFinish = (values: any) => {
    mutate(values);
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <UserAuthDetail />
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default UserForm;
