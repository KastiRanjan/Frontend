import React from 'react';
import { Button } from 'antd';

interface FormButtonWrapperProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  label: string;
}

const FormButtonWrapper: React.FC<FormButtonWrapperProps> = ({ variant, disabled, label }) => (
  <Button type={variant === 'primary' ? 'primary' : 'default'} htmlType="submit" disabled={disabled}>
    {label}
  </Button>
);

export default FormButtonWrapper;
