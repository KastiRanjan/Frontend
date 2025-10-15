import React, { useState } from 'react';
import { Form, Select, Input, Button, Card, message, Space } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvaluation, CreateEvaluationDto } from '@/service/project-evaluation.service';

const { TextArea } = Input;
const { Option } = Select;

interface EvaluationFormProps {
  projectId: string;
  userId: string;
  userName: string;
  isTeamLead?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ratingOptions = [
  { value: 'very_good', label: 'Very Good', color: '#52c41a' },
  { value: 'good', label: 'Good', color: '#95de64' },
  { value: 'neutral', label: 'Neutral', color: '#faad14' },
  { value: 'poor', label: 'Poor', color: '#ff7a45' },
  { value: 'bad', label: 'Bad', color: '#ff4d4f' },
];

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  projectId,
  userId,
  userName,
  isTeamLead = false,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const createMutation = useMutation({
    mutationFn: createEvaluation,
    onSuccess: () => {
      message.success('Evaluation submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['project-evaluations', projectId] });
      form.resetFields();
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to submit evaluation');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload: CreateEvaluationDto = {
      projectId,
      evaluatedUserId: userId,
      ...values
    };
    createMutation.mutate(payload);
  };

  return (
    <Card title={`Performance Evaluation - ${userName}`} bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          worklogTime: 'neutral',
          behaviour: 'neutral',
          learning: 'neutral',
          communication: 'neutral',
          accountability: 'neutral',
          ...(isTeamLead && {
            harmony: 'neutral',
            coordination: 'neutral'
          })
        }}
      >
        <Form.Item
          label="Project Worklog Time"
          name="worklogTime"
          rules={[{ required: true, message: 'Please rate worklog time' }]}
        >
          <Select size="large">
            {ratingOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Behaviour"
          name="behaviour"
          rules={[{ required: true, message: 'Please rate behaviour' }]}
        >
          <Select size="large">
            {ratingOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Learning"
          name="learning"
          rules={[{ required: true, message: 'Please rate learning' }]}
        >
          <Select size="large">
            {ratingOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Communication"
          name="communication"
          rules={[{ required: true, message: 'Please rate communication' }]}
        >
          <Select size="large">
            {ratingOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Accountability (Responsible)"
          name="accountability"
          rules={[{ required: true, message: 'Please rate accountability' }]}
        >
          <Select size="large">
            {ratingOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color, fontWeight: 'bold' }}>
                  {option.label}
                </span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {isTeamLead && (
          <>
            <Form.Item
              label="Harmony"
              name="harmony"
              rules={[{ required: true, message: 'Please rate harmony' }]}
            >
              <Select size="large">
                {ratingOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <span style={{ color: option.color, fontWeight: 'bold' }}>
                      {option.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Coordination"
              name="coordination"
              rules={[{ required: true, message: 'Please rate coordination' }]}
            >
              <Select size="large">
                {ratingOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    <span style={{ color: option.color, fontWeight: 'bold' }}>
                      {option.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Additional Remarks"
          name="remarks"
        >
          <TextArea rows={4} placeholder="Add any additional remarks..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Evaluation
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EvaluationForm;
