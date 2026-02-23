import React from "react";
import { Form, Input, Button, Card, Typography, Alert, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useClientLogin } from "@/hooks/clientReport";
import { ClientLoginPayload } from "@/types/clientUser";
import { useClientAuth } from "@/context/ClientAuthContext";
import axios from "axios";

const { Title, Text } = Typography;

const ClientLogin: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useClientLogin();
  const { checkAuth } = useClientAuth();

  const onFinish = (values: ClientLoginPayload) => {
    login(values, {
      onSuccess: async (data) => {
        // Store token and auto-select first customer
        localStorage.setItem("client_token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        if (data.customers?.length > 0) {
          localStorage.setItem("selected_customer_id", data.customers[0].id);
        }
        message.success("Login successful");
        
        // Refresh auth context
        await checkAuth();
        
        // Navigate after small delay to ensure state updates
        setTimeout(() => {
          navigate("/client-portal", { replace: true });
        }, 100);
      },
      onError: (err: any) => {
        message.error(err.response?.data?.message || "Login failed");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Client Portal
          </Title>
          <Text type="secondary">
            Sign in to access your reports and documents
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={(error as any).response?.data?.message || "Invalid credentials"}
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

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter your password"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Link
            to="/client-forgot-password"
            className="text-blue-600 hover:text-blue-800"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="text-center mt-6 pt-6 border-t">
          <Text type="secondary">
            Not a client? <Link to="/login" className="text-blue-600">Staff Login</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ClientLogin;
