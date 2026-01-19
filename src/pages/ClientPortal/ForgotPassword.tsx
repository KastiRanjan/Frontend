import React from "react";
import { Form, Input, Button, Card, Typography, Alert, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useClientForgotPassword } from "@/hooks/clientReport";

const { Title, Text } = Typography;

const ClientForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const { mutate: forgotPassword, isPending, isSuccess, error } = useClientForgotPassword();

  const onFinish = (values: { email: string }) => {
    forgotPassword(values, {
      onSuccess: () => {
        message.success("Password reset link sent to your email");
        form.resetFields();
      },
      onError: () => {
        message.error("Failed to send reset link. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Forgot Password
          </Title>
          <Text type="secondary">
            Enter your email and we'll send you a reset link
          </Text>
        </div>

        {isSuccess && (
          <Alert
            message="Email Sent"
            description="If an account exists with this email, you will receive a password reset link."
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        {error && (
          <Alert
            message="Error"
            description="Failed to send reset link. Please try again."
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              size="large"
              className="w-full"
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Link
            to="/client-login"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ClientForgotPassword;
