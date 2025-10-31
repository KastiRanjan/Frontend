import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, message } from "antd";
import { useLogin } from "@/hooks/auth/useLogin";
import FormInputWrapper from "../FormInputWrapper";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { useEffect } from "react";

export const LoginForm = () => {
  const [form] = Form.useForm();
  const login = useLogin();

  // Check for any stored message from session and display it
  useEffect(() => {
    const storedMessage = sessionStorage.getItem('loginMessage');
    if (storedMessage) {
      message.warning(storedMessage);
      sessionStorage.removeItem('loginMessage');
    }
  }, []);

  const onFinish = (values: any) => {
    // Always lowercase the username before submitting
    const payload = {
      ...values,
      username: values.username ? values.username.toLowerCase() : values.username,
    };
    login.mutate(payload, {
      onSuccess: () => {
        message.success("Login successful!");
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Login failed!";
        const errorCode = error?.response?.data?.code;
        
        // Handle specific error codes
        if (errorCode === 1012 || errorMessage.toLowerCase().includes('inactive')) {
          message.error("Your account is inactive. Please contact the administrator.");
        } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('credential')) {
          message.error("Invalid username or password.");
        } else {
          message.error(errorMessage);
        }
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
      <Form layout="vertical" form={form} onFinish={onFinish} className="" autoComplete="off">
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
          type="text"
          autoComplete="off"
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
          passwordInput={true}
          type="password"
          autoComplete="off"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Form.Item
            name="remember"
            valuePropName="checked"
            noStyle
            initialValue={false}
            style={{ marginBottom: 0 }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <div className="mt-5">
          <Button size="large" loading={login.isPending} type="primary" htmlType="submit" className="w-full">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};
