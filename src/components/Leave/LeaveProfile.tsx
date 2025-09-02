import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Progress,
  Divider,
  Statistic,
  Alert
} from 'antd';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  EyeOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { useSession } from '../../context/SessionContext';
import { 
  fetchUserLeaveBalances, 
  fetchUserLeaves 
} from '../../service/leave.service';
import LeaveRequestModal from './LeaveRequestModal';
import LeaveDetailsModal from './LeaveDetailsModal';
import { LeaveType } from '../../types/leave';

const { Title, Text } = Typography;

interface LeaveProfileProps {
  userId?: string;
  showTitle?: boolean;
}

const LeaveProfile: React.FC<LeaveProfileProps> = ({ 
  userId, 
  showTitle = true 
}) => {
  const { profile } = useSession();
  const targetUserId = userId || (profile as any)?.id;
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Fetch leave balances
  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['leave-balances', targetUserId],
    queryFn: () => fetchUserLeaveBalances(targetUserId!),
    enabled: !!targetUserId
  });

  // Fetch user's recent leaves
  const { data: recentLeaves = [], isLoading: leavesLoading } = useQuery({
    queryKey: ['user-leaves', targetUserId],
    queryFn: () => fetchUserLeaves(),
    enabled: !!targetUserId
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved_by_lead: 'blue',
      approved_by_pm: 'cyan',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: 'Pending Review',
      approved_by_lead: 'Approved by Lead',
      approved_by_pm: 'Approved by PM',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: ['leaveType', 'name'],
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Period',
      key: 'period',
      render: (_: any, record: LeaveType) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {moment(record.startDate).format('MMM DD')} - {moment(record.endDate).format('MMM DD, YYYY')}
          </Text>
          <Text type="secondary">
            {moment(record.endDate).diff(moment(record.startDate), 'days') + 1} days
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Applied',
      dataIndex: 'createdAt',
      key: 'applied',
      render: (date: string) => moment(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveType) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLeave(record);
            setIsDetailsModalVisible(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  if (balancesLoading || leavesLoading) {
    return (
      <Card loading={true}>
        <div style={{ height: '300px' }} />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={showTitle ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: '8px' }} />
            <Title level={4} style={{ margin: 0 }}>Leave Management</Title>
          </div>
        ) : null}
        extra={
          targetUserId === (profile as any)?.id ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsRequestModalVisible(true)}
            >
              Request Leave
            </Button>
          ) : null
        }
      >
        {/* Leave Balances */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5}>Leave Balances ({moment().year()})</Title>
          {balances.length === 0 ? (
            <Alert
              message="No leave types configured"
              type="info"
              showIcon
            />
          ) : (
            <Row gutter={[16, 16]}>
              {balances.map((balance: any, index: number) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title={balance.leaveType.name}
                      value={balance.remainingDays || 'Unlimited'}
                      suffix={balance.maxDays ? `/ ${balance.maxDays}` : ''}
                      valueStyle={{ 
                        color: balance.remainingDays && balance.remainingDays < 5 ? '#ff4d4f' : '#3f8600' 
                      }}
                    />
                    {balance.maxDays && (
                      <Progress
                        percent={Math.round(((balance.maxDays - balance.remainingDays) / balance.maxDays) * 100)}
                        size="small"
                        status={balance.remainingDays < 3 ? 'exception' : 'normal'}
                        showInfo={false}
                        style={{ marginTop: '8px' }}
                      />
                    )}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Used: {balance.usedDays} days
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        <Divider />

        {/* Recent Leaves */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5}>Recent Leave Applications</Title>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">Last 6 months</Text>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={recentLeaves.slice(0, 10)} // Show recent 10
            rowKey="id"
            size="small"
            pagination={recentLeaves.length > 10 ? { pageSize: 10 } : false}
            locale={{
              emptyText: 'No leave applications found'
            }}
          />
        </div>
      </Card>

      {/* Modals */}
      <LeaveRequestModal
        open={isRequestModalVisible}
        onCancel={() => setIsRequestModalVisible(false)}
        onSuccess={() => {
          setIsRequestModalVisible(false);
          // Refresh data
          window.location.reload();
        }}
      />

      <LeaveDetailsModal
        visible={isDetailsModalVisible}
        leave={selectedLeave}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedLeave(null);
        }}
      />
    </>
  );
};

export default LeaveProfile;
