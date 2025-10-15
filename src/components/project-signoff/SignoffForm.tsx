import React, { useState } from 'react';
import { Form, Select, Input, Button, Card, message, Space, Radio, Divider } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSignoff, CreateSignoffDto } from '@/service/project-signoff.service';

const { TextArea } = Input;
const { Option } = Select;

interface SignoffFormProps {
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const qualityOptions = [
  { value: 'excellent', label: 'Excellent', color: '#52c41a' },
  { value: 'good', label: 'Good', color: '#95de64' },
  { value: 'satisfactory', label: 'Satisfactory', color: '#faad14' },
  { value: 'needs_improvement', label: 'Needs Improvement', color: '#ff7a45' },
  { value: 'poor', label: 'Poor', color: '#ff4d4f' },
];

const SignoffForm: React.FC<SignoffFormProps> = ({
  projectId,
  projectName,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const createMutation = useMutation({
    mutationFn: createSignoff,
    onSuccess: () => {
      message.success('Project signed off successfully');
      queryClient.invalidateQueries({ queryKey: ['project-signoff', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      form.resetFields();
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to sign off project');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload: CreateSignoffDto = {
      projectId,
      ...values
    };
    createMutation.mutate(payload);
  };

  return (
    <Card title={`Project Sign-off - ${projectName}`} bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          wasTeamFit: true,
          completionQuality: 'good',
          facedProblems: false,
          wentAsPlanned: true
        }}
      >
        <Divider orientation="left">1. Team Fitness Assessment</Divider>
        
        <Form.Item
          label="Was the team fit for this project?"
          name="wasTeamFit"
          rules={[{ required: true, message: 'Please select team fitness' }]}
        >
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Team Fitness Remark"
          name="teamFitnessRemark"
          rules={[{ required: true, message: 'Please provide team fitness remark' }]}
        >
          <TextArea 
            rows={3} 
            placeholder="Provide detailed remarks about team fitness for the project..." 
          />
        </Form.Item>

        <Divider orientation="left">2. Project Completion Quality</Divider>

        <Form.Item
          label="Overall Completion Quality"
          name="completionQuality"
          rules={[{ required: true, message: 'Please rate completion quality' }]}
        >
          <Select size="large">
            {qualityOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Quality Remark (Optional)"
          name="qualityRemark"
        >
          <TextArea 
            rows={3} 
            placeholder="Add remarks about the quality of project completion..." 
          />
        </Form.Item>

        <Divider orientation="left">3. Project Planning & Execution</Divider>

        <Form.Item
          label="Did the project go as planned?"
          name="wentAsPlanned"
          rules={[{ required: true, message: 'Please select planning status' }]}
        >
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Did the team face any problems?"
          name="facedProblems"
          rules={[{ required: true, message: 'Please select problem status' }]}
        >
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Problems & Planning Remark (Optional)"
          name="problemsRemark"
        >
          <TextArea 
            rows={3} 
            placeholder="Describe any problems faced or deviations from the plan..." 
          />
        </Form.Item>

        <Divider orientation="left">4. Future Suggestions</Divider>

        <Form.Item
          label="Future Suggestions (Optional)"
          name="futureSuggestions"
        >
          <TextArea 
            rows={4} 
            placeholder="Provide suggestions for future projects or improvements..." 
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Sign Off Project
            </Button>
            {onCancel && (
              <Button onClick={onCancel} size="large">
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignoffForm;
