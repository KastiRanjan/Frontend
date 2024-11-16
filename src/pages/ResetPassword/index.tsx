import { useState } from 'react';
import { Form, Input, Button, message, Grid } from 'antd';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import Title from 'antd/es/typography/Title';
import { useParams } from 'react-router-dom';

const ResetPasswordForm = () => {
    const [form] = Form.useForm();
    const { token } = useParams()
    const { mutate: resetPassword } = useResetPassword();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await resetPassword({ ...values, token });
            message.success('Password reset successfully!');
            form.resetFields();
        } catch (error) {
            message.error('Failed to reset password!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
            <div>
                <Title level={3}>Reset Password</Title>
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
                            { min: 6, message: 'Password must be at least 6 characters!' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Please input your confirm password!' },
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

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
