import React, { useState } from 'react';
import { Card, Row, Col, Input, Button, Checkbox, message } from 'antd';
import Helmet from 'react-helmet';
import { useNavigate } from 'react-router-dom'; // Change here
import useLogin from './hooks/useLogin'; // Adjust path as necessary

const LoginPage: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false); // State for remember me
  
  const { login, loading, error } = useLogin();

  const handleLogin = async () => {
    try {
      const response = await login(username, password, remember); // Pass remember state
      message.success('Login successful!');
      console.log(response); // Handle successful response, e.g., store token
      
      // Redirect to home page
      navigate('/'); // Change here to use navigate
    } catch (err) {
      if (error) {
        message.error(error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    margin: 0,
    padding: 0,
  };

  return (
    <div style={pageStyle}>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card title="Login" bordered={false} style={{ textAlign: 'center' }}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={passwordVisible ? 'text' : 'password'}
              iconRender={visible => (visible ? '👁️' : '👁️‍🗨️')}
            />
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)} // Update remember state
            >
              Remember me
            </Checkbox>
            <Button type="link" onClick={togglePasswordVisibility} style={{ marginBottom: 16 }}>
              {passwordVisible ? 'Hide' : 'Show'} Password
            </Button>
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={handleLogin}
              loading={loading} // Show loading state
            >
              Login
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
