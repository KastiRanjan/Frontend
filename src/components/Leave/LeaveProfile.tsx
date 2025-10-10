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
  Alert,
  Popconfirm,
  message
} from 'antd';
import { 
  hasAnyLeaveApprovalPermission 
} from '../../utils/leavePermissions';
import {
  getLeaveStatusColor,
  getLeaveStatusText,
  handleLeaveApproval,
  handleLeaveRejection
} from '../../utils/leaveHelpers';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  // EyeOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useSession } from '../../context/SessionContext';
import { usePendingApprovals, useDeleteLeave } from '../../hooks/leave';
import { 
  fetchUserLeaveBalances, 
  fetchUserLeaves,
  approveLeave,
  rejectLeave,
  fetchLeavesForUser
} from '../../service/leave.service';
import LeaveRequestModal from './LeaveRequestModal';
import EditLeaveModal from './EditLeaveModal';
// import LeaveDetailsModal from './LeaveDetailsModal';
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
  const { profile, permissions } = useSession();
  const targetUserId = userId || (profile as any)?.id;
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveType | null>(null);
  // const [selectedLeave, setSelectedLeave] = useState<LeaveType | null>(null);
  // const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Fetch leave balances
  const { data: balances = [], isLoading: balancesLoading } = useQuery({
    queryKey: ['leave-balances', targetUserId],
    queryFn: () => fetchUserLeaveBalances(targetUserId!),
    enabled: !!targetUserId
  });

  // Fetch user's leaves. When viewing another user's profile, fetch that user's leaves
  const { data: recentLeaves = [], isLoading: leavesLoading } = useQuery({
    queryKey: ['user-leaves', targetUserId],
    queryFn: () => (targetUserId && targetUserId !== (profile as any)?.id ? fetchLeavesForUser(targetUserId) : fetchUserLeaves()),
    enabled: !!targetUserId
  });

  // Fetch pending approvals for current session user (not the profile user)
  // Use our custom hook for pending approvals that handles superuser permissions correctly
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = usePendingApprovals();

  // Delete mutation
  const deleteLeaveMutation = useDeleteLeave();

  // Use shared helper functions
  const getStatusColor = getLeaveStatusColor;
  const getStatusText = getLeaveStatusText;

  // Mutations for approve/reject
  const queryClient = useQueryClient();

  const handleDeleteLeave = async (leaveId: string) => {
    try {
      await deleteLeaveMutation.mutateAsync(leaveId);
      message.success('Leave request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete leave request');
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await rejectMutation.mutateAsync({ leaveId });
      message.success('Leave request cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  const handleEditLeave = (leave: LeaveType) => {
    setLeaveToEdit(leave);
    setIsEditMode(true);
    // Don't set isRequestModalVisible - we only want the EditLeaveModal to open
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
      render: (_: any, record: LeaveType) => {
        // Check if this is the user's own leave
        const isOwnLeave = record.user.id === targetUserId;
        const isPending = record.status === 'pending' || record.status === 'approved_by_manager';
        
        // Check if the current user has approval permission
        const hasApprovalPermission = hasAnyLeaveApprovalPermission(permissions || []);
        
        // Determine if the user can approve this specific leave request
        const canApprove = hasApprovalPermission && isPending;
        
        // User can edit/delete their own leaves if pending or approved_by_manager
        const canEdit = isOwnLeave && isPending;
        const canDelete = isOwnLeave && record.status === 'pending';
        const canCancel = isOwnLeave && isPending && !canDelete;
        
        return (
          <Space direction="vertical" size="small">
            {/* Pending approvals - show approve/reject */}
            {canApprove && isPending && (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleLeaveApproval(record.id, approveMutation)}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleLeaveRejection(record.id, (profile as any)?.id, rejectMutation)}
                >
                  Reject
                </Button>
              </Space>
            )}
            
            {/* Edit/Delete/Cancel buttons for own leaves */}
            {isOwnLeave && (
              <Space>
                {canEdit && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditLeave(record)}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Popconfirm
                    title="Delete Leave Request"
                    description="Are you sure you want to delete this leave request? This action cannot be undone."
                    onConfirm={() => handleDeleteLeave(record.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deleteLeaveMutation.isPending}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                )}
                {canCancel && (
                  <Popconfirm
                    title="Cancel Leave Request"
                    description="Are you sure you want to cancel this leave request? This will reject it and you will need to create a new request."
                    onConfirm={() => handleCancelLeave(record.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<CloseCircleOutlined />}
                      loading={rejectMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )}
            
            {/* Removed override buttons */}
          </Space>
        );
      }
    }
  ];

  // Mutations for approve/reject
  const approveMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => approveLeave(leaveId),
    onSuccess: () => {
      message.success('Leave approved');
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to approve leave');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => rejectLeave(leaveId, (profile as any)?.id),
    onSuccess: () => {
      message.success('Leave rejected');
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to reject leave');
    }
  });

  // Override functionality removed per requirements

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

        {/* Other Leave Requests Section - Show pending approvals for current user */}
        {permissions?.includes('leave:approve') && (
          <>
            <Divider />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={5}>Other Leave Requests (Pending Approval)</Title>
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">{pendingApprovals.length} pending</Text>
                </Space>
              </div>

              <Table
                columns={[
                  {
                    title: 'Employee',
                    key: 'employee',
                    render: (record: LeaveType) => (
                      <Space direction="vertical" size={0}>
                        <Text strong>{record.user.name}</Text>
                        <Text type="secondary">{record.user.email}</Text>
                      </Space>
                    )
                  },
                  {
                    title: 'Type',
                    dataIndex: ['leaveType', 'name'],
                    key: 'type',
                    render: (type: string, record: LeaveType) => (
                      <Tag color="blue">{type || record.type}</Tag>
                    )
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
                    render: (_: any, record: LeaveType) => {
                      const isPending = record.status === 'pending' || record.status === 'approved_by_manager';
                      return (
                        <Space>
                          {/*
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
                          */}
                          {isPending && (
                            <>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => {
                                  handleLeaveApproval(record.id, approveMutation);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                danger
                                size="small"
                                onClick={() => {
                                  handleLeaveRejection(record.id, (profile as any)?.id, rejectMutation);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Space>
                      );
                    }
                  }
                ]}
                dataSource={pendingApprovals}
                rowKey="id"
                size="small"
                loading={approvalsLoading}
                pagination={pendingApprovals.length > 10 ? { pageSize: 10 } : false}
                locale={{
                  emptyText: 'No pending approvals'
                }}
              />
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      <LeaveRequestModal
        open={isRequestModalVisible && !isEditMode}
        onCancel={() => {
          setIsRequestModalVisible(false);
          setIsEditMode(false);
          setLeaveToEdit(null);
        }}
        onSuccess={() => {
          setIsRequestModalVisible(false);
          setIsEditMode(false);
          setLeaveToEdit(null);
          // Refresh data
          window.location.reload();
        }}
      />

      <EditLeaveModal
        open={isEditMode && leaveToEdit !== null}
        leave={leaveToEdit}
        onCancel={() => {
          setIsEditMode(false);
          setLeaveToEdit(null);
        }}
        onSuccess={() => {
          setIsEditMode(false);
          setLeaveToEdit(null);
          // Refresh data
          window.location.reload();
        }}
      />

      {/* TODO: Fix LeaveDetailsModal import issue
      <LeaveDetailsModal
        visible={isDetailsModalVisible}
        leave={selectedLeave}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedLeave(null);
        }}
      />
      */}
    </>
  );
};

export default LeaveProfile;
