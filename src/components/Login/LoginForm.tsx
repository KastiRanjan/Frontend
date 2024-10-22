import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, message } from "antd";
import { useLogin } from "@/hooks/auth/useLogin";
import FormInputWrapper from "../FormInputWrapper";

export const LoginForm = () => {
  const [form] = Form.useForm();
  const login = useLogin();

  const onFinish = (values: any) => {
    login.mutate(values, {
      onSuccess: (data) => {
        message.success("Login successful!");
      },
      onError: (error: any) => {
        message.error(error?.response?.data?.message || "Login failed!");
      },
    });
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      className="bg-white shadow p-5"
    >
      <FormInputWrapper
        id="email"
        name="username"
        rules={[
          {
            required: true,
            whitespace: true,
            message: "Invalid user!",
          },
        ]}
        placeholder="Enter your email"
        icon={<UserOutlined />}
      />

      <FormInputWrapper
        id="password"
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
        placeholder="Enter your password"
        icon={<LockOutlined />}
      />
      <Form.Item name="remember" valuePropName="checked" noStyle>
        <Checkbox>Remember me</Checkbox>
      </Form.Item>
      <div className="mt-5">
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
};
