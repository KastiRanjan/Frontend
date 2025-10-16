import { useState } from 'react';
import { forgotPassword } from '@/service/auth.service';
import { Form, Input, Button, Result, Typography, message } from 'antd';
import Title from 'antd/es/typography/Title';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(values.email);
      setSuccess(true);
      message.success('Password reset link sent to your email!');
    } catch (err: any) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Result
          status="success"
          title="Check your email!"
          subTitle="A password reset link has been sent to your email address."
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <Title level={3}>Forgot Password</Title>
        <Paragraph type="secondary" style={{ marginBottom: '20px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </Paragraph>
        {error && (
          <div style={{ marginBottom: '20px' }}>
            <Result status="error" title="Error" subTitle={error} />
          </div>
        )}
        <Form name="forgot-password" layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Button type="link" onClick={() => navigate('/login')}>Return to Login</Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
