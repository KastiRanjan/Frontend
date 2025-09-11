import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Result, Alert, Typography } from 'antd';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import Title from 'antd/es/typography/Title';
import { useParams, Link, useNavigate } from 'react-router-dom';

const { Paragraph, Text } = Typography;

// Password validation regex patterns
const passwordValidations = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /\d/,
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
};

const ResetPasswordForm = () => {
    const [form] = Form.useForm();
    const { token } = useParams();
    const { mutate: resetPassword } = useResetPassword();
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    // If no token is provided, redirect to login
    useEffect(() => {
        if (!token) {
            message.error('Invalid password reset link');
            navigate('/login');
        }
    }, [token, navigate]);

    // Check password strength as user types
    const checkPasswordStrength = (password: string) => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        if (password.length >= passwordValidations.minLength) strength++;
        if (passwordValidations.hasUppercase.test(password)) strength++;
        if (passwordValidations.hasLowercase.test(password)) strength++;
        if (passwordValidations.hasNumber.test(password)) strength++;
        if (passwordValidations.hasSpecialChar.test(password)) strength++;

        setPasswordStrength(strength);
    };

    const onFinish = async (values: any) => {
        if (!token) {
            setResetError('Invalid reset token');
            return;
        }
        
        setLoading(true);
        setResetError(null);
        
        try {
            await resetPassword({ token, password: values.password });
            setResetSuccess(true);
            message.success('Password reset successfully!');
            form.resetFields();
        } catch (err: any) {
            // Handle different types of errors
            console.error('Password reset error:', err);
            
            if (err.response?.status === 404) {
                setResetError('Reset link is invalid or has expired.');
            } else if (err.response?.data?.message) {
                setResetError(err.response.data.message);
            } else {
                setResetError('Failed to reset password. Please try again or contact support.');
            }
            
            message.error('Failed to reset password!');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 2) return 'red';
        if (passwordStrength < 4) return 'orange';
        return 'green';
    };

    if (resetSuccess) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
                <Result
                    status="success"
                    title="Password Reset Successful!"
                    subTitle="Your password has been changed successfully."
                    extra={[
                        <Button type="primary" key="login">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
            <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
                <Title level={3}>Reset Password</Title>
                
                {resetError && (
                    <Alert
                        message="Error"
                        description={resetError}
                        type="error"
                        showIcon
                        style={{ marginBottom: '20px' }}
                    />
                )}
                
                <Form
                    form={form}
                    name="reset-password"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        label="New Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: passwordValidations.minLength, message: `Password must be at least ${passwordValidations.minLength} characters!` },
                            {
                                validator: (_, value) => {
                                    if (!value || passwordValidations.hasUppercase.test(value)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password must contain at least one uppercase letter!'));
                                },
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || passwordValidations.hasLowercase.test(value)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password must contain at least one lowercase letter!'));
                                },
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || passwordValidations.hasNumber.test(value)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password must contain at least one number!'));
                                },
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || passwordValidations.hasSpecialChar.test(value)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password must contain at least one special character!'));
                                },
                            },
                        ]}
                    >
                        <Input.Password 
                            onChange={(e) => checkPasswordStrength(e.target.value)}
                        />
                    </Form.Item>
                    
                    {form.getFieldValue('password') && (
                        <div style={{ marginBottom: '15px' }}>
                            <Text>Password strength: </Text>
                            <Text strong style={{ color: getPasswordStrengthColor() }}>
                                {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Medium' : 'Strong'}
                            </Text>
                            <div style={{ 
                                height: '5px', 
                                background: '#f0f0f0', 
                                marginTop: '5px',
                                borderRadius: '2px'
                            }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${(passwordStrength / 5) * 100}%`, 
                                    background: getPasswordStrengthColor(),
                                    borderRadius: '2px'
                                }} />
                            </div>
                        </div>
                    )}

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Paragraph type="secondary" style={{ marginBottom: '20px' }}>
                        Password must be at least {passwordValidations.minLength} characters and include uppercase letters, lowercase letters, numbers, and special characters.
                    </Paragraph>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                    
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Link to="/login">Return to Login</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
