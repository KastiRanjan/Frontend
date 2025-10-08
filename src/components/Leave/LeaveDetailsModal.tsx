import React from 'react';
import { 
  Modal, 
  Descriptions, 
  Tag, 
  Typography, 
  Space, 
  Divider, 
  Steps,
  Alert
} from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { LeaveType } from '../../types/leave';

const { Text } = Typography;

interface LeaveDetailsModalProps {
  visible: boolean;
  leave: LeaveType | null;
  onCancel: () => void;
}

const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  visible,
  leave,
  onCancel
}) => {
  if (!leave) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      approved_by_manager: 'cyan',
      approved: 'green',
      rejected: 'red',
      // Legacy status codes for backward compatibility
      approved_by_lead: 'blue',
      approved_by_pm: 'cyan'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: 'Pending Manager Review',
      approved_by_manager: 'Approved by Manager',
      approved: 'Fully Approved',
      rejected: 'Rejected',
      // Legacy status codes for backward compatibility
      approved_by_lead: 'Approved by Lead (Legacy)',
      approved_by_pm: 'Approved by Manager (Legacy)'
    };
    return statusTexts[status] || status;
  };

  const getApprovalSteps = (): Array<{
    title: string;
    status: "error" | "finish" | "process" | "wait";
    icon: JSX.Element;
  }> => {
    // New simplified two-level approval process: Manager → Admin
    const steps = [
      {
        title: 'Applied',
        status: 'finish' as "finish",
        icon: <UserOutlined />
      },
      {
        title: 'Manager Review',
        status: leave.status === 'pending' ? 'process' as "process" : 
               leave.status === 'rejected' ? 'error' as "error" : 'finish' as "finish",
        icon: leave.status === 'rejected' ? <CloseCircleOutlined /> : <CheckCircleOutlined />
      },
      {
        title: 'Admin/Superuser Approval',
        status: leave.status === 'approved_by_manager' ? 'process' as "process" :
               leave.status === 'approved' ? 'finish' as "finish" :
               leave.status === 'rejected' ? 'error' as "error" : 'wait' as "wait",
        icon: leave.status === 'rejected' ? <CloseCircleOutlined /> : <CheckCircleOutlined />
      }
    ];

    return steps;
  };

  const calculateDays = () => {
    const start = moment(leave.startDate);
    const end = moment(leave.endDate);
    return end.diff(start, 'days') + 1;
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          Leave Application Details
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: '16px' }}>
        <Tag color={getStatusColor(leave.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
          {getStatusText(leave.status)}
        </Tag>
      </div>

      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Employee">
          <Space>
            <UserOutlined />
            {leave.user.firstName} {leave.user.lastName}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Leave Type">
          <Tag color="blue">{leave.type}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Period">
          <Space direction="vertical" size={0}>
            <Text strong>
              {moment(leave.startDate).format('MMMM DD, YYYY')} - {moment(leave.endDate).format('MMMM DD, YYYY')}
            </Text>
            <Text type="secondary">
              <ClockCircleOutlined style={{ marginRight: '4px' }} />
              {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
            </Text>
          </Space>
        </Descriptions.Item>
        
        {leave.reason && (
          <Descriptions.Item label="Reason">
            <Text>{leave.reason}</Text>
          </Descriptions.Item>
        )}
        
        <Descriptions.Item label="Applied On">
          {moment(leave.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
        </Descriptions.Item>
        
        {leave.updatedAt !== leave.createdAt && (
          <Descriptions.Item label="Last Updated">
            {moment(leave.updatedAt).format('MMMM DD, YYYY [at] HH:mm')}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <div>
        <Text strong style={{ marginBottom: '16px', display: 'block' }}>
          Approval Process
        </Text>
        
        {leave.status === 'rejected' && (
          <Alert
            message="Leave Rejected"
            description="This leave application has been rejected during the approval process."
            type="error"
            style={{ marginBottom: '16px' }}
          />
        )}
        
        <Steps
          direction="vertical"
          size="small"
          items={getApprovalSteps()}
        />
      </div>

      {leave.status === 'approved' && (
        <Alert
          message="Leave Approved"
          type="success"
          style={{ marginTop: '16px' }}
          showIcon
        />
      )}
    </Modal>
  );
};

export default LeaveDetailsModal;
