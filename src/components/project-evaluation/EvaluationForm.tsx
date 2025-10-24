import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space, Radio } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvaluation, CreateEvaluationDto } from '@/service/project-evaluation.service';

const { TextArea } = Input;

interface EvaluationFormProps {
  projectId: string;
  userId: string;
  userName: string;
  isTeamLead?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ratingOptions = [
  { value: 'very_good', label: 'Very Good', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' },
  { value: 'good', label: 'Good', color: '#73d13d', bgColor: '#f6ffed', borderColor: '#95de64' },
  { value: 'neutral', label: 'Neutral', color: '#faad14', bgColor: '#fffbe6', borderColor: '#ffd666' },
  { value: 'poor', label: 'Poor', color: '#ff7a45', bgColor: '#fff2e8', borderColor: '#ffbb96' },
  { value: 'bad', label: 'Bad', color: '#ff4d4f', bgColor: '#fff1f0', borderColor: '#ffa39e' },
];

// Custom CSS for better radio button styling
const customRadioStyle = `
  .evaluation-radio-group .ant-radio-button-wrapper {
    height: 40px;
    line-height: 38px;
    padding: 0 20px;
    border-radius: 8px !important;
    border: 2px solid #d9d9d9;
    transition: all 0.3s ease;
    font-weight: 500;
    margin-right: 8px;
    margin-bottom: 8px;
  }
  
  .evaluation-radio-group .ant-radio-button-wrapper:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .evaluation-radio-group .ant-radio-button-wrapper-checked {
    border-width: 2px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
  }
  
  .evaluation-radio-group .ant-radio-button-wrapper:not(:first-child)::before {
    display: none;
  }
  
  .evaluation-radio-group .ant-radio-button-wrapper:first-child {
    border-radius: 8px !important;
  }
  
  .evaluation-radio-group .ant-radio-button-wrapper:last-child {
    border-radius: 8px !important;
  }
`;

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
      <style>{customRadioStyle}</style>
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
          label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Project Worklog Time</span>}
          name="worklogTime"
          rules={[{ required: true, message: 'Please rate worklog time' }]}
        >
          <Radio.Group className="evaluation-radio-group">
            {ratingOptions.map(option => (
              <Radio.Button 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: option.bgColor,
                  borderColor: option.borderColor,
                  color: option.color
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Behaviour</span>}
          name="behaviour"
          rules={[{ required: true, message: 'Please rate behaviour' }]}
        >
          <Radio.Group className="evaluation-radio-group">
            {ratingOptions.map(option => (
              <Radio.Button 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: option.bgColor,
                  borderColor: option.borderColor,
                  color: option.color
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Learning</span>}
          name="learning"
          rules={[{ required: true, message: 'Please rate learning' }]}
        >
          <Radio.Group className="evaluation-radio-group">
            {ratingOptions.map(option => (
              <Radio.Button 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: option.bgColor,
                  borderColor: option.borderColor,
                  color: option.color
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Communication</span>}
          name="communication"
          rules={[{ required: true, message: 'Please rate communication' }]}
        >
          <Radio.Group className="evaluation-radio-group">
            {ratingOptions.map(option => (
              <Radio.Button 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: option.bgColor,
                  borderColor: option.borderColor,
                  color: option.color
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Accountability (Responsible)</span>}
          name="accountability"
          rules={[{ required: true, message: 'Please rate accountability' }]}
        >
          <Radio.Group className="evaluation-radio-group">
            {ratingOptions.map(option => (
              <Radio.Button 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: option.bgColor,
                  borderColor: option.borderColor,
                  color: option.color
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        {isTeamLead && (
          <>
            <Form.Item
              label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Harmony</span>}
              name="harmony"
              rules={[{ required: true, message: 'Please rate harmony' }]}
            >
              <Radio.Group className="evaluation-radio-group">
                {ratingOptions.map(option => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    style={{ 
                      backgroundColor: option.bgColor,
                      borderColor: option.borderColor,
                      color: option.color
                    }}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={<span style={{ fontSize: '15px', fontWeight: 600 }}>Coordination</span>}
              name="coordination"
              rules={[{ required: true, message: 'Please rate coordination' }]}
            >
              <Radio.Group className="evaluation-radio-group">
                {ratingOptions.map(option => (
                  <Radio.Button 
                    key={option.value} 
                    value={option.value}
                    style={{ 
                      backgroundColor: option.bgColor,
                      borderColor: option.borderColor,
                      color: option.color
                    }}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
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
