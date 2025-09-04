import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col,
  Statistic,
  Modal,
  message
} from 'antd';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useSession } from '../../context/SessionContext';
import { 
  fetchUserLeaves,
  fetchUserLeaveBalances,
  getPendingApprovals,
  approveLeave,
  rejectLeave,
  overrideLeave,
  fetchLeavesForUser
} from '../../service/leave.service';
import LeaveRequestModal from '../../components/Leave/LeaveRequestModal';
import LeaveDetailsModal from '../../components/Leave/LeaveDetailsModal';
import { LeaveType } from '../../types/leave';

const { Title, Text } = Typography;

interface LeaveManagementProps {
  userId?: string; // optional, when viewing someone's profile
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ userId: profileUserId }) => {
  const { profile, permissions } = useSession();
  const queryClient = useQueryClient();
  const userId = profileUserId || (profile as any)?.id;
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch user's leave balances
  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['leave-balances', userId],
  queryFn: () => fetchUserLeaveBalances(userId),
    enabled: !!userId
  });

  // Fetch user's leaves. If viewing a profile user's page (profileUserId passed), use fetchLeavesForUser
  const { data: userLeaves = [], isLoading: leavesLoading } = useQuery({
    queryKey: ['user-leaves', userId],
    queryFn: () => (profileUserId ? fetchLeavesForUser(userId) : fetchUserLeaves()),
    enabled: !!userId
  });

  // Fetch pending approvals (for leads, PMs, and admins)
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-approvals', userId],
    queryFn: () => getPendingApprovals(),
    // Only fetch pending approvals for current session user (approver). Do not fetch when viewing someone else's profile unless the session user is that approver.
    enabled: !!userId && !!(permissions?.includes('leave:approve') || false) && !profileUserId
  });

  // Approval mutations
  const approveMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => {
      console.log('Approving leave with ID:', leaveId, typeof leaveId);
      return approveLeave(leaveId);
    },
    onSuccess: () => {
      message.success('Leave approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
    },
    onError: (error: any) => {
      console.error('Approve leave error:', error);
      message.error(error?.response?.data?.message || 'Failed to approve leave');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => {
      console.log('Rejecting leave with ID:', leaveId, typeof leaveId, 'userId:', userId, typeof userId);
      return rejectLeave(leaveId, userId);
    },
    onSuccess: () => {
      message.success('Leave rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
    },
    onError: (error: any) => {
      console.error('Reject leave error:', error);
      message.error(error?.response?.data?.message || 'Failed to reject leave');
    }
  });

  const overrideMutation = useMutation({
    mutationFn: ({ leaveId, newStatus }: { leaveId: string, newStatus?: 'pending' | 'rejected' }) => 
      overrideLeave(leaveId, newStatus || 'pending'),
    onSuccess: () => {
      message.success('Leave approval overridden');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to override approval');
    }
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

  const handleApprove = (leaveId: string) => {
    Modal.confirm({
      title: 'Approve Leave',
      content: 'Are you sure you want to approve this leave request?',
      onOk: () => approveMutation.mutate({ leaveId })
    });
  };

  const handleReject = (leaveId: string) => {
    Modal.confirm({
      title: 'Reject Leave',
      content: 'Are you sure you want to reject this leave request?',
      onOk: () => rejectMutation.mutate({ leaveId })
    });
  };

  const handleOverride = (leaveId: string, newStatus: 'pending' | 'rejected') => {
    const actionText = newStatus === 'pending' ? 'revert to pending' : 'reject';
    Modal.confirm({
      title: 'Override Approval',
      content: `This will override the current approval and ${actionText} this leave. Are you sure?`,
      onOk: () => overrideMutation.mutate({ leaveId, newStatus })
    });
  };

  const myLeavesColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Period',
      key: 'period',
      render: (record: LeaveType) => (
        <div>
          <div>{moment(record.startDate).format('MMM DD')} - {moment(record.endDate).format('MMM DD, YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(record.endDate).diff(moment(record.startDate), 'days') + 1} days
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: 'Applied',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LeaveType) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLeave(record);
            setIsDetailsModalOpen(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  const approvalsColumns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (record: LeaveType) => (
        <div>
          <div>{record.user.firstName} {record.user.lastName}</div>
          <Text type="secondary">{record.user.email}</Text>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Period',
      key: 'period',
      render: (record: LeaveType) => (
        <div>
          <div>{moment(record.startDate).format('MMM DD')} - {moment(record.endDate).format('MMM DD, YYYY')}</div>
          <Text type="secondary">
            {moment(record.endDate).diff(moment(record.startDate), 'days') + 1} days
          </Text>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LeaveType) => {
        const isPending = ['pending', 'approved_by_lead', 'approved_by_pm'].includes(record.status);
        const isApproved = record.status === 'approved';
        const currentUserRole = (profile as any)?.role?.name?.toLowerCase() || '';
        const requesterRole = record.user?.role?.name?.toLowerCase() || '';
        
        // Check if current user can override this approved leave
        const canOverride = isApproved && 
          ((currentUserRole === 'superuser') ||
           (currentUserRole === 'administrator' && ['manager', 'projectlead', 'auditjunior'].includes(requesterRole)) ||
           (currentUserRole === 'manager' && ['projectlead', 'auditjunior'].includes(requesterRole)) ||
           (currentUserRole === 'projectlead' && requesterRole === 'auditjunior'));

        return (
          <Space direction="vertical" size="small">
            {/* Pending approvals */}
            {isPending && (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.id)}
                  loading={approveMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record.id)}
                  loading={rejectMutation.isPending}
                >
                  Reject
                </Button>
              </Space>
            )}
            
            {/* Already approved - show override options */}
            {canOverride && (
              <Space>
                <Button
                  type="default"
                  size="small"
                  style={{ color: '#fa8c16', borderColor: '#fa8c16' }}
                  onClick={() => handleOverride(record.id, 'pending')}
                  loading={overrideMutation.isPending}
                >
                  Override → Pending
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleOverride(record.id, 'rejected')}
                  loading={overrideMutation.isPending}
                >
                  Override → Reject
                </Button>
              </Space>
            )}
            
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedLeave(record);
                setIsDetailsModalOpen(true);
              }}
            >
              View
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Leave Management</Title>
      </div>

      {/* Leave Balances */}
      <Card 
        title="Leave Balances" 
        style={{ marginBottom: '24px' }}
        loading={balancesLoading}
      >
        <Row gutter={16}>
          {balances.map((balance: any) => (
            <Col span={6} key={balance.leaveType.name}>
              <Card>
                <Statistic
                  title={balance.leaveType.name}
                  value={balance.remainingDays || 'Unlimited'}
                  suffix={balance.maxDays ? `/ ${balance.maxDays}` : ''}
                  prefix={<CalendarOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Used: {balance.usedDays} days
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* My Leave Requests */}
      <Card
        title="My Leave Requests"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsRequestModalOpen(true)}
          >
            Request Leave
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        <Table
          dataSource={userLeaves}
          columns={myLeavesColumns}
          loading={leavesLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No leave requests found' }}
        />
      </Card>

      {/* Pending Approvals & Overridable Leaves */}
      {permissions?.includes('leave:approve') && (
        <Card
          title="Leave Approvals & Overrides"
          extra={
            <Space>
              <ClockCircleOutlined />
              <Text>{pendingApprovals.filter((leave: LeaveType) => ['pending', 'approved_by_lead', 'approved_by_pm'].includes(leave.status)).length} pending</Text>
              <Text>•</Text>
              <Text>{pendingApprovals.filter((leave: LeaveType) => leave.status === 'approved').length} overridable</Text>
            </Space>
          }
        >
          <Table
            dataSource={pendingApprovals}
            columns={approvalsColumns}
            loading={approvalsLoading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No leave requests requiring action' }}
          />
        </Card>
      )}

      {/* Modals */}
      <LeaveRequestModal
        open={isRequestModalOpen}
        onCancel={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          setIsRequestModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
          queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
        }}
      />

      <LeaveDetailsModal
        visible={isDetailsModalOpen}
        leave={selectedLeave}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedLeave(null);
        }}
      />
    </div>
  );
};

export default LeaveManagement;
