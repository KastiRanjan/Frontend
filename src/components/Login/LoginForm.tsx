import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, message } from "antd";
import { useLogin } from "@/hooks/auth/useLogin";
import FormInputWrapper from "../FormInputWrapper";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export const LoginForm = () => {
  const [form] = Form.useForm();
  const login = useLogin();

  const onFinish = (values: any) => {
    login.mutate(values, {
      onSuccess: () => {
        message.success("Login successful!");
      },
      onError: (error: any) => {
        message.error(error?.response?.data?.message || "Login failed!");
      },
    });
  };

  return (
    <div>
      <Title level={3} className="text-center">
        Login
      </Title>
      <Paragraph className="text-center">
        Enter your credentials to login.
      </Paragraph>

      {/* Form */}
      <Form layout="vertical" form={form} onFinish={onFinish} className="">
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
        <Form.Item
          name="remember"
          valuePropName="checked"
          noStyle
          initialValue={false}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <div className="mt-5">
          <Button size="large" loading={login.isPending} type="primary" htmlType="submit" className="w-full">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};
