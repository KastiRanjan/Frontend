import React, { useState } from 'react';
import axios from 'axios';
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
  message,
  Tooltip,
  notification,
  Modal,
  Select,
  Form,
  Popconfirm
} from 'antd';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useSession } from '../../context/SessionContext';
import { 
  fetchUserLeaves,
  fetchUserLeaveBalances,
  approveLeave,
  rejectLeave,
  fetchLeavesForUser
} from '../../service/leave.service';
import { usePendingApprovals, useDeleteLeave } from '../../hooks/leave';
import LeaveRequestModal from '../../components/Leave/LeaveRequestModal';
import LeaveDetailsModal from '../../components/Leave/LeaveDetailsModal';
import EditLeaveModal from '../../components/Leave/EditLeaveModal';
import { LeaveType } from '../../types/leave';
// Removed notification import - backend handles notifications automatically
import {
  getLeaveStatusColor,
  getLeaveStatusText,
  handleLeaveApproval,
  handleLeaveRejection
} from '../../utils/leaveHelpers';
import {
  canApplyForLeave as checkCanApplyForLeave,
  canViewUserLeaves as checkCanViewUserLeaves,
  hasAnyLeaveApprovalPermission as checkHasAnyLeaveApprovalPermission
} from '../../utils/permissionHelpers';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [leaveToEdit, setLeaveToEdit] = useState<LeaveType | null>(null);
  
  // Permission checks using our permission helper functions
  const permissionsArr = permissions || [];
  
  // Check if user can apply for leave
  const canApplyForLeave = permissionsArr.length > 0 ? checkCanApplyForLeave(permissionsArr) : false;
  
  // Check if user has any leave approval permissions
  const canApproveLeaves = permissionsArr.length > 0 ? checkHasAnyLeaveApprovalPermission(permissionsArr) : false;
  
  // Check if user can view other users' leaves
  const canViewUserLeaves = permissionsArr.length > 0 ? checkCanViewUserLeaves(permissionsArr) : false;

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
    // Enable if viewing own leaves or if viewing another user's leaves and has proper permission
    enabled: !!userId && (profileUserId ? canViewUserLeaves : true)
  });

  // Fetch pending approvals (for leads, PMs, and admins)
  // Use our custom hook that handles permissions correctly and works with updated backend
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = usePendingApprovals();

  // Approval mutations
  const approveMutation = useMutation({
    mutationFn: ({ leaveId, notifyAdmins }: { leaveId: string, notifyAdmins?: string[] }) => {
      console.log('Approving leave with ID:', leaveId, typeof leaveId, 'notifyAdmins:', notifyAdmins);
      return approveLeave(leaveId, notifyAdmins);
    },
    onSuccess: () => {
      message.success('Leave approved successfully');
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
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
      
      // Show notification to user who requested leave
      notification.error({
        message: 'Leave Request Rejected',
        description: 'Your leave request has been rejected. Please contact your manager for more information.',
      });
      
      // Backend automatically sends notifications - no manual calls needed
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
    onError: (error: any) => {
      console.error('Reject leave error:', error);
      message.error(error?.response?.data?.message || 'Failed to reject leave');
    }
  });

  // Override functionality removed per requirements

  // Delete mutation
  const deleteLeaveMutation = useDeleteLeave();

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
    // Don't set isRequestModalOpen - we only want the EditLeaveModal to open
  };

  // Use shared helper functions from leaveHelpers.ts
  const getStatusColor = getLeaveStatusColor;
  const getStatusText = getLeaveStatusText;

  // State for admin notification selection
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [showAdminSelection, setShowAdminSelection] = useState<boolean>(false);
  const [currentLeaveId, setCurrentLeaveId] = useState<string | null>(null);
  
  // Fetch admin users for notification selection
  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        // Fetch users with admin role
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/users`, {
          params: { role: 'admin', status: 'active', limit: 50, page: 1 }
        });
        return response.data.results || [];
      } catch (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use shared handler functions with extended functionality
  const handleApprove = (leaveId: string) => {
    const isManager = (profile as any)?.role?.name === 'manager' || (profile as any)?.role?.name === 'project_manager';
    
    // If approver is manager, show admin selection modal
    if (isManager) {
      setCurrentLeaveId(leaveId);
      setShowAdminSelection(true);
    } else {
      // If approver is admin, just approve
      handleLeaveApproval(leaveId, approveMutation);
    }
  };
  
  // Function to finalize approval after admin selection
  const handleFinalizeApproval = () => {
    if (currentLeaveId) {
      // Validate that at least one admin is selected
      if (selectedAdmins.length === 0) {
        message.error('Please select at least one admin to notify');
        return;
      }
      
      approveMutation.mutate({ 
        leaveId: currentLeaveId,
        notifyAdmins: selectedAdmins 
      });
      
      // Backend automatically sends notifications - no manual calls needed
      
      // Reset state
      setCurrentLeaveId(null);
      setShowAdminSelection(false);
      setSelectedAdmins([]);
    }
  };

  const handleReject = (leaveId: string) => {
    handleLeaveRejection(leaveId, userId, rejectMutation);
  };

  // Override functionality removed per requirements

  const myLeavesColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a: LeaveType, b: LeaveType) => {
        const typeA = a.leaveType?.name || a.type;
        const typeB = b.leaveType?.name || b.type;
        return typeA.localeCompare(typeB);
      },
      filters: [
        { text: 'Annual Leave', value: 'Annual Leave' },
        { text: 'Sick Leave', value: 'Sick Leave' },
        { text: 'Personal Leave', value: 'Personal Leave' },
        { text: 'Unpaid Leave', value: 'Unpaid Leave' }
      ],
      onFilter: (value: any, record: LeaveType) => 
        (record.leaveType?.name || record.type) === value,
      render: (type: string, record: LeaveType) => (
        <Tag color="blue">
          {record.leaveType?.name || type}
        </Tag>
      )
    },
    {
      title: 'Period',
      key: 'period',
      sorter: (a: LeaveType, b: LeaveType) => moment(a.startDate).diff(moment(b.startDate)),
      render: (record: LeaveType) => {
        if (record.isCustomDates && record.customDates) {
          // Display custom dates
          const sortedDates = record.customDates.sort();
          return (
            <div>
              <div>
                <strong>Custom Dates</strong>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {sortedDates.length <= 3 
                  ? sortedDates.map(date => moment(date).format('MMM DD')).join(', ')
                  : `${sortedDates.slice(0, 2).map(date => moment(date).format('MMM DD')).join(', ')} +${sortedDates.length - 2} more`
                }
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>{sortedDates.length} days</Text>
              </div>
            </div>
          );
        } else {
          // Display date range
          return (
            <div>
              <div>
                <strong>{moment(record.startDate).format('MMM DD')} - {moment(record.endDate).format('MMM DD, YYYY')}</strong>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {moment(record.endDate).diff(moment(record.startDate), 'days') + 1} days
              </Text>
            </div>
          );
        }
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || <Text type="secondary">No reason provided</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: LeaveType, b: LeaveType) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Manager Approved', value: 'approved_by_manager' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' }
      ],
      onFilter: (value: any, record: LeaveType) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: LeaveType, b: LeaveType) => moment(a.createdAt).diff(moment(b.createdAt)),
      render: (date: string, record: LeaveType) => (
        <Tooltip title={
          <div>
            <p>Requested by: {record.user.name}</p>
            <p>Requested to: {record.requestedManager?.name || "Manager"}</p>
            <p>Time: {moment(date).format('MMM DD, YYYY HH:mm')}</p>
          </div>
        }>
          <span>{moment(date).format('MMM DD, YYYY')}</span>
        </Tooltip>
      )
    },
    {
      title: 'Approvers',
      key: 'approvers',
      render: (record: LeaveType) => (
        <div>
          {record.managerApproverId && (
            <div style={{ marginBottom: '4px' }}>
              <Tooltip title={
                <div>
                  <p>Approved by: {record.managerApprover ? 
                    record.managerApprover.name : 
                    "Manager"}</p>
                  <p>Time: {record.updatedAt ? moment(record.updatedAt).format('MMM DD, YYYY HH:mm') : "Unknown"}</p>
                </div>
              }>
                <Tag color="green">Manager Approved</Tag>
              </Tooltip>
            </div>
          )}
          {record.adminApproverId && (
            <div>
              <Tooltip title={
                <div>
                  <p>Approved by: {record.adminApprover ? 
                    record.adminApprover.name : 
                    "Admin"}</p>
                  <p>Time: {record.updatedAt ? moment(record.updatedAt).format('MMM DD, YYYY HH:mm') : "Unknown"}</p>
                </div>
              }>
                <Tag color="purple">Admin Approved</Tag>
              </Tooltip>
            </div>
          )}
          {(!record.managerApproverId && !record.adminApproverId) && (
            <Text type="secondary">Not yet approved</Text>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LeaveType) => {
        const isOwnLeave = record.user.id === userId;
        const canEdit = isOwnLeave && (record.status === 'pending' || record.status === 'approved_by_manager');
        const canDelete = isOwnLeave && (record.status === 'pending');
        const canCancel = isOwnLeave && (record.status === 'pending' || record.status === 'approved_by_manager');
        
        return (
          <Space size="small" direction="vertical">
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
            <Space>
              {canEdit && (
                <Button
                  type="link"
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
                    icon={<DeleteOutlined />}
                    loading={deleteLeaveMutation.isPending}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}
              {canCancel && !canDelete && (
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
                    icon={<CloseCircleOutlined />}
                    loading={rejectMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Space>
        );
      }
    }
  ];

  const approvalsColumns = [
    {
      title: 'Employee',
      key: 'employee',
      sorter: (a: LeaveType, b: LeaveType) => {
        const nameA = a.user.name;
        const nameB = b.user.name;
        return nameA.localeCompare(nameB);
      },
      filters: [
        { text: 'Developer', value: 'developer' },
        { text: 'Project Manager', value: 'project_manager' },
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' }
      ],
      onFilter: (value: any, record: LeaveType): boolean => {
        if (!record.user.role) return false;
        
        const roleName = record.user.role.name.toLowerCase();
        const roleDisplayName = record.user.role.displayName ? 
          record.user.role.displayName.toLowerCase() : '';
        
        return roleName === value || roleDisplayName === value;
      },
      render: (record: LeaveType) => (
        <div>
          <div><strong>{record.user.name}</strong></div>
          <Text type="secondary">{record.user.email}</Text>
          {record.user.role && (
            <div>
              <Tag color="default" style={{ fontSize: '10px', marginTop: '4px' }}>
                {record.user.role.displayName || record.user.role.name}
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a: LeaveType, b: LeaveType) => {
        const typeA = a.leaveType?.name || a.type;
        const typeB = b.leaveType?.name || b.type;
        return typeA.localeCompare(typeB);
      },
      filters: [
        { text: 'Annual Leave', value: 'Annual Leave' },
        { text: 'Sick Leave', value: 'Sick Leave' },
        { text: 'Personal Leave', value: 'Personal Leave' },
        { text: 'Unpaid Leave', value: 'Unpaid Leave' }
      ],
      onFilter: (value: any, record: LeaveType) => 
        (record.leaveType?.name || record.type) === value,
      render: (type: string, record: LeaveType) => (
        <Tag color="blue">
          {record.leaveType?.name || type}
        </Tag>
      )
    },
    {
      title: 'Period',
      key: 'period',
      sorter: (a: LeaveType, b: LeaveType) => moment(a.startDate).diff(moment(b.startDate)),
      render: (record: LeaveType) => {
        if (record.isCustomDates && record.customDates) {
          // Display custom dates
          const sortedDates = record.customDates.sort();
          return (
            <div>
              <div><strong>Custom Dates</strong></div>
              <Text type="secondary">
                {sortedDates.length <= 3 
                  ? sortedDates.map(date => moment(date).format('MMM DD')).join(', ')
                  : `${sortedDates.slice(0, 2).map(date => moment(date).format('MMM DD')).join(', ')} +${sortedDates.length - 2} more`
                }
              </Text>
              <div>
                <Text type="secondary">{sortedDates.length} days</Text>
              </div>
            </div>
          );
        } else {
          // Display date range
          return (
            <div>
              <div><strong>{moment(record.startDate).format('MMM DD')} - {moment(record.endDate).format('MMM DD, YYYY')}</strong></div>
              <Text type="secondary">
                {moment(record.endDate).diff(moment(record.startDate), 'days') + 1} days
              </Text>
            </div>
          );
        }
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => reason || <Text type="secondary">No reason provided</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: LeaveType, b: LeaveType) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Manager Approved', value: 'approved_by_manager' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' }
      ],
      onFilter: (value: any, record: LeaveType) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: 'Request Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: LeaveType, b: LeaveType) => moment(a.createdAt).diff(moment(b.createdAt)),
      render: (date: string, record: LeaveType) => (
        <Tooltip title={
          <div>
            <p>Requested by: {record.user.name}</p>
            <p>Requested to: {record.requestedManager?.name || "Manager"}</p>
            <p>Time: {moment(date).format('MMM DD, YYYY HH:mm')}</p>
          </div>
        }>
          <span>{moment(date).format('MMM DD, YYYY')}</span>
        </Tooltip>
      )
    },
    {
      title: 'Approved By',
      key: 'approvedBy',
      render: (record: LeaveType) => (
        <div style={{ minWidth: '150px' }}>
          {record.managerApprover && (
            <div style={{ marginBottom: '4px' }}>
              <Tooltip title={`Manager approved on: ${moment(record.managerApprovalTime).format('MMM DD, YYYY [at] HH:mm')}`}>
                <Tag color="blue">
                  Manager: {record.managerApprover.name}
                </Tag>
              </Tooltip>
            </div>
          )}
          {record.adminApprover && (
            <div>
              <Tooltip title={`Final approved on: ${moment(record.adminApprovalTime).format('MMM DD, YYYY [at] HH:mm')}`}>
                <Tag color="green">
                  Final: {record.adminApprover.name}
                </Tag>
              </Tooltip>
            </div>
          )}
          {(!record.managerApprover && !record.adminApprover) && (
            <Text type="secondary">Not yet approved</Text>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LeaveType) => {
        const isPending = ['pending', 'approved_by_manager'].includes(record.status);
        const isManagerApproved = record.status === 'approved_by_manager';
        const isManager = (profile as any)?.role?.name === 'projectmanager' || (profile as any)?.role?.name === 'project_manager';
        
        // Don't show approve/reject buttons for managers if they've already approved
        const showApproveButtons = isPending && !(isManagerApproved && isManager);

        return (
          <Space direction="vertical" size="small">
            {/* Pending approvals */}
            {showApproveButtons && (
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
            
            {/* Show status for managers who have already approved */}
            {isManagerApproved && isManager && (
              <div style={{ marginBottom: '8px' }}>
                <Tag color="blue" icon={<CheckCircleOutlined />}>
                  You approved this request
                </Tag>
              </div>
            )}
            
            {/* Admins can review already approved leaves but we removed explicit override buttons */}
            
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
            disabled={!canApplyForLeave}
            title={!canApplyForLeave ? "You don't have permission to apply for leave" : undefined}
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
          scroll={{ x: 'max-content' }}
          onChange={(pagination, filters, sorter) => {
            console.log('Table params:', { pagination, filters, sorter });
          }}
        />
      </Card>

      {/* Pending Approvals & Overridable Leaves - Only visible to users with approval permissions */}
      {canApproveLeaves && (
        <Card
          title="Incoming Request Approvals"
          extra={
            <Space>
              <ClockCircleOutlined />
              <Text>{pendingApprovals.filter((leave: any) => ['pending', 'approved_by_manager'].includes(leave.status)).length} pending</Text>
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
            scroll={{ x: 'max-content' }}
            onChange={(pagination, filters, sorter) => {
              console.log('Approvals table params:', { pagination, filters, sorter });
            }}
            // Removed special highlighting for "overridable" leaves
          />
        </Card>
      )}

      {/* Modals */}
      <LeaveRequestModal
        open={isRequestModalOpen && !isEditMode}
        onCancel={() => {
          setIsRequestModalOpen(false);
          setIsEditMode(false);
          setLeaveToEdit(null);
        }}
        onSuccess={() => {
          setIsRequestModalOpen(false);
          setIsEditMode(false);
          setLeaveToEdit(null);
          queryClient.invalidateQueries({ queryKey: ['user-leaves'] });
          queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
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
      
      {/* Admin Selection Modal */}
      <Modal
        title="Select Admins to Notify"
        open={showAdminSelection}
        onCancel={() => {
          setShowAdminSelection(false);
          setCurrentLeaveId(null);
          setSelectedAdmins([]);
        }}
        onOk={handleFinalizeApproval}
        confirmLoading={approveMutation.isPending}
        okButtonProps={{ disabled: selectedAdmins.length === 0 }}
      >
        <Form layout="vertical">
          <Form.Item 
            label="Select Admins to be notified:" 
            required
            validateStatus={selectedAdmins.length === 0 ? 'error' : 'success'}
            help={selectedAdmins.length === 0 ? 'Please select at least one admin to notify' : ''}
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select admins to notify (required)"
              value={selectedAdmins}
              onChange={(values) => setSelectedAdmins(values)}
              loading={adminsLoading}
              optionFilterProp="children"
            >
              {adminUsers.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div>
            <p>
              <strong>Note:</strong> Selected admins will be notified immediately when this leave is approved 
              and they will be able to provide final approval.
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
