import React from 'react';
import { Form, Input } from 'antd';

interface FormInputWrapperProps {
  name: string;
  rules?: any[]; // Consider using a more specific type
  icon?: React.ReactNode;
  placeholder?: string;
  passwordInput?: boolean;
  id?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add this line
}

const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  name,
  rules,
  icon,
  placeholder,
  passwordInput,
  id,
  type = 'text',
  onChange, // Destructure onChange
}) => (
  <Form.Item name={name} rules={rules}>
    <Input
      id={id}
      prefix={icon}
      type={passwordInput ? 'password' : type}
      placeholder={placeholder}
      onChange={onChange} // Pass onChange to the Input
    />
  </Form.Item>
);

export default FormInputWrapper;
