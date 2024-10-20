import React, { useState, useEffect } from 'react';
import { Checkbox, Form, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import AlertMessage from '../../components/AlertMessage';
import FormInputWrapper from '../../components/FormInputWrapper';
import FormButtonWrapper from '../../components/FormButtonWrapper';
import { Link } from 'react-router-dom';
import messages from './message';
import commonMessage from './common/message'; 
const { Title } = Typography;

interface FormValues {
  username: string;
  password: string;
  remember: boolean;
}

const LoginForm: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({ username: '', password: '', remember: false });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!formValues.username || !formValues.password) {
      setErrors(['Please fill in all fields']);
      return;
    }

    setIsLoading(true);
    try {
      await fakeApiLogin(formValues);
      // Handle successful login, e.g., redirect
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['An unexpected error occurred']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fakeApiLogin = (values: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (values.username === 'user' && values.password === 'password') {
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  useEffect(() => {
    if (errors.length) {
      // Handle errors, e.g., show alert
    }
  }, [errors]);

  return (
    <Form onFinish={handleFinish} initialValues={formValues}>
      <Title level={3}>
        {messages.inputLogin.defaultMessage}
      </Title>

      <AlertMessage />

      <FormInputWrapper
        name="username"
        id="username"
        type="text"
        rules={[{ required: true, message: commonMessage.emailRequired.defaultMessage }]}
        icon={<UserOutlined className="site-form-item-icon" />}
        placeholder={commonMessage.emailPlaceHolder.defaultMessage}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues({ ...formValues, username: e.target.value })}
      />

      <FormInputWrapper
        passwordInput
        rules={[{ required: true, message: commonMessage.passwordRequired.defaultMessage }]}
        name="password"
        id="password"
        type="password"
        icon={<LockOutlined className="site-form-item-icon" />}
        placeholder={commonMessage.passwordPlaceHolder.defaultMessage}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues({ ...formValues, password: e.target.value })}
      />

      <Form.Item>
        <div className="d-flex">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox onChange={(e) => setFormValues({ ...formValues, remember: e.target.checked })}>
              {messages.rememberMe.defaultMessage}
            </Checkbox>
          </Form.Item>
          <div className="ml-auto">
            <Link className="login-form-forgot" to="/forgot-password">
              {messages.lostPassword.defaultMessage}
            </Link>
          </div>
        </div>
      </Form.Item>

      <FormButtonWrapper
        variant="primary"
        disabled={isLoading}
        label={messages.submit.defaultMessage}
      />
      <Link className="link" to="/register">
        {messages.register.defaultMessage}
      </Link>
    </Form>
  );
};

export default LoginForm;
