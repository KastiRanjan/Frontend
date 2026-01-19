import React from "react";
import { Form, Input, Button, Card, Typography, Alert, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useClientResetPassword } from "@/hooks/clientReport";

const { Title, Text } = Typography;

const ClientResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { mutate: resetPassword, isPending, error } = useClientResetPassword();

  const onFinish = (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    resetPassword(
      { token: token || "", password: values.password },
      {
        onSuccess: () => {
          message.success("Password reset successful. Please login.");
          navigate("/client-login");
        },
        onError: () => {
          message.error("Failed to reset password. The link may be expired.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Reset Password
          </Title>
          <Text type="secondary">
            Enter your new password
          </Text>
        </div>

        {error && (
          <Alert
            message="Error"
            description="Failed to reset password. The link may be invalid or expired."
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
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 6, message: "Password must be at least 6 characters" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter new password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm new password"
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
              Reset Password
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

export default ClientResetPassword;
