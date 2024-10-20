import React from 'react';
import { Form } from 'antd';

interface FormWrapperProps {
  children: React.ReactNode;
  onFinish: () => void;
  initialValues?: any;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ children, onFinish, initialValues }) => (
  <Form initialValues={initialValues} onFinish={onFinish}>
    {children}
  </Form>
);

export default FormWrapper;
