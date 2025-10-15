import React from 'react';
import { Card, Descriptions, Tag, Typography, Empty, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getSignoffByProject } from '@/service/project-signoff.service';

const { Title, Paragraph } = Typography;

interface SignoffDetailsProps {
  projectId: string;
}

const qualityColors: Record<string, string> = {
  excellent: '#52c41a',
  good: '#95de64',
  satisfactory: '#faad14',
  needs_improvement: '#ff7a45',
  poor: '#ff4d4f',
};

const qualityLabels: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Good',
  satisfactory: 'Satisfactory',
  needs_improvement: 'Needs Improvement',
  poor: 'Poor',
};

const SignoffDetails: React.FC<SignoffDetailsProps> = ({ projectId }) => {
  const { data: signoff, isLoading, error } = useQuery({
    queryKey: ['project-signoff', projectId],
    queryFn: () => getSignoffByProject(projectId),
    enabled: !!projectId,
    retry: false
  });

  if (isLoading) {
    return (
      <Card>
        <Spin tip="Loading sign-off details..." />
      </Card>
    );
  }

  if (error || !signoff) {
    return (
      <Card>
        <Empty description="Project sign-off not completed yet" />
      </Card>
    );
  }

  return (
    <Card title="Project Sign-off Details">
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Signed Off By">
          {signoff.signedOffBy?.name || 'Unknown'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Sign-off Date">
          {new Date(signoff.signoffDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: 24 }}>1. Team Fitness Assessment</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Was Team Fit?">
          {signoff.wasTeamFit ? (
            <Tag icon={<CheckCircleOutlined />} color="success">Yes</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="error">No</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Team Fitness Remark">
          <Paragraph>{signoff.teamFitnessRemark}</Paragraph>
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: 24 }}>2. Project Completion Quality</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Quality Rating">
          <Tag color={qualityColors[signoff.completionQuality]}>
            {qualityLabels[signoff.completionQuality]}
          </Tag>
        </Descriptions.Item>
        {signoff.qualityRemark && (
          <Descriptions.Item label="Quality Remark">
            <Paragraph>{signoff.qualityRemark}</Paragraph>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Title level={5} style={{ marginTop: 24 }}>3. Project Planning & Execution</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Went As Planned?">
          {signoff.wentAsPlanned ? (
            <Tag icon={<CheckCircleOutlined />} color="success">Yes</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="warning">No</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Faced Problems?">
          {signoff.facedProblems ? (
            <Tag icon={<CloseCircleOutlined />} color="warning">Yes</Tag>
          ) : (
            <Tag icon={<CheckCircleOutlined />} color="success">No</Tag>
          )}
        </Descriptions.Item>
        {signoff.problemsRemark && (
          <Descriptions.Item label="Problems Remark">
            <Paragraph>{signoff.problemsRemark}</Paragraph>
          </Descriptions.Item>
        )}
      </Descriptions>

      {signoff.futureSuggestions && (
        <>
          <Title level={5} style={{ marginTop: 24 }}>4. Future Suggestions</Title>
          <Card>
            <Paragraph>{signoff.futureSuggestions}</Paragraph>
          </Card>
        </>
      )}
    </Card>
  );
};

export default SignoffDetails;
