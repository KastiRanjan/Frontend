import React from 'react';
import { Alert } from 'antd';

const AlertMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert
      message={message}
      type="error"
      showIcon
      style={{ marginBottom: '16px' }}
    />
  );
};

export default AlertMessage;
