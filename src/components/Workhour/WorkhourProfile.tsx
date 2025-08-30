import React from 'react';
import { Card, Typography, Row, Col, Tag, Divider, Skeleton } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useWorkhours } from '../../hooks/workhour/useWorkhour';
import { resolveWorkhour } from '../../service/workhour.service';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;

interface WorkhourProfileProps {
  userId?: number;
  userRole?: string;
  userName?: string;
  showTitle?: boolean;
}

const WorkhourProfile: React.FC<WorkhourProfileProps> = ({
  userId,
  userRole,
  userName,
  showTitle = true
}) => {
  // Fetch user's resolved work hours
  const { data: resolvedHours, isLoading: loadingResolved } = useQuery({
    queryKey: ['workhour-resolved', userId],
    queryFn: () => resolveWorkhour(userId!),
    enabled: !!userId
  });

  // Fetch all work hour configurations for context
  const { data: workhours = [], isLoading: loadingAll } = useWorkhours();

  const isLoading = loadingResolved || loadingAll;

  // Find user-specific and role-specific configurations
  const userSpecificConfig = workhours.find((wh: any) => wh.userId === userId);
  const roleConfig = workhours.find((wh: any) => wh.role === userRole && !wh.userId);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const getConfigurationSource = () => {
    if (userSpecificConfig) {
      return { source: 'User-specific', priority: 'High', color: '#52c41a' };
    } else if (roleConfig) {
      return { source: 'Role-based', priority: 'Medium', color: '#1890ff' };
    } else {
      return { source: 'System default', priority: 'Low', color: '#faad14' };
    }
  };

  const configSource = getConfigurationSource();

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={showTitle ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          <Title level={4} style={{ margin: 0 }}>Work Hour Assignment</Title>
        </div>
      ) : null}
      style={{ width: '100%' }}
    >
      {userName && (
        <div style={{ marginBottom: '16px' }}>
          <UserOutlined style={{ marginRight: '8px' }} />
          <Text strong>{userName}</Text>
          {userRole && <Tag style={{ marginLeft: '8px' }}>{userRole}</Tag>}
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
              {resolvedHours || 8}
            </Title>
            <Text type="secondary">Daily Work Hours</Text>
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
              {formatTime((resolvedHours || 8) * 5)}
            </Title>
            <Text type="secondary">Weekly Total</Text>
          </div>
        </Col>
      </Row>

      <Divider />

      <div>
        <Title level={5}>Configuration Details</Title>
        
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Text>Source: </Text>
          </Col>
          <Col>
            <Tag color={configSource.color}>
              {configSource.source}
            </Tag>
          </Col>
          <Col>
            <Text type="secondary">Priority: {configSource.priority}</Text>
          </Col>
        </Row>

        {userSpecificConfig && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
            <Text strong style={{ color: '#52c41a' }}>User-Specific Override Active</Text>
            <br />
            <Text type="secondary">
              This user has a custom work hour configuration that overrides role defaults.
            </Text>
          </div>
        )}

        {!userSpecificConfig && roleConfig && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '6px' }}>
            <Text strong style={{ color: '#1890ff' }}>Role-Based Configuration</Text>
            <br />
            <Text type="secondary">
              Work hours are set based on the "{userRole}" role configuration.
            </Text>
          </div>
        )}

        {!userSpecificConfig && !roleConfig && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbe6', borderRadius: '6px' }}>
            <Text strong style={{ color: '#faad14' }}>System Default</Text>
            <br />
            <Text type="secondary">
              Using system default work hours (8 hours/day). No specific role or user configuration found.
            </Text>
          </div>
        )}
      </div>

      <Divider />

      <div>
        <Title level={5}>Work Schedule Breakdown</Title>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary">Daily Hours:</Text>
          </Col>
          <Col span={12}>
            <Text strong>{resolvedHours || 8} hours</Text>
          </Col>
          
          <Col span={12}>
            <Text type="secondary">Weekly Hours:</Text>
          </Col>
          <Col span={12}>
            <Text strong>{(resolvedHours || 8) * 5} hours</Text>
          </Col>
          
          <Col span={12}>
            <Text type="secondary">Monthly Hours:</Text>
          </Col>
          <Col span={12}>
            <Text strong>~{((resolvedHours || 8) * 22).toFixed(0)} hours</Text>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default WorkhourProfile;
