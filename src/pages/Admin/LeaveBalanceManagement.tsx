import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Select,
  InputNumber,
  message,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  Modal,
  Tag
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  SwapOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  allocateLeaveToUser,
  allocateLeaveToAllUsers,
  carryOverLeave
} from '../../service/leave.service';
import { useActiveLeaveTypes } from '../../hooks/useLeaveTypes';
import { fetchUsers } from '../../service/user.service';
import moment from 'moment';

const { Title, Text } = Typography;

const LeaveBalanceManagement: React.FC = () => {
  const [singleUserForm] = Form.useForm();
  const [allUsersForm] = Form.useForm();
  const [carryOverForm] = Form.useForm();
  const queryClient = useQueryClient();
  const currentYear = moment().year();

  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const { data: leaveTypes = [], isLoading: isLoadingLeaveTypes } = useActiveLeaveTypes();

  // Fetch active users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await fetchUsers({ 
        status: 'active', 
        limit: 1000, 
        page: 1, 
        keywords: '' 
      });
      
      // Handle the paginated response structure
      if (response && response.results && Array.isArray(response.results)) {
        setUsers(response.results);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.error('Unexpected users response format:', response);
        setUsers([]);
        message.error('Failed to parse user data');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Mutation for allocating to single user
  const allocateSingleMutation = useMutation({
    mutationFn: allocateLeaveToUser,
    onSuccess: () => {
      message.success('Leave allocated successfully to user');
      singleUserForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to allocate leave');
    }
  });

  // Mutation for allocating to all users
  const allocateAllMutation = useMutation({
    mutationFn: allocateLeaveToAllUsers,
    onSuccess: () => {
      message.success('Leave allocated successfully to all active users');
      allUsersForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to allocate leave to all users');
    }
  });

  // Mutation for carry over
  const carryOverMutation = useMutation({
    mutationFn: carryOverLeave,
    onSuccess: (data) => {
      Modal.success({
        title: 'Carry Over Completed',
        content: (
          <div>
            <p>Carry over process has been completed:</p>
            <ul>
              <li>Successful: {data.success}</li>
              <li>Failed: {data.failed}</li>
            </ul>
            {data.details && data.details.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Details:</Text>
                <div style={{ maxHeight: 300, overflowY: 'auto', marginTop: 8 }}>
                  {data.details.map((detail: any, index: number) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Tag color={detail.status === 'success' ? 'green' : detail.status === 'failed' ? 'red' : 'default'}>
                        {detail.status}
                      </Tag>
                      <Text>{detail.userName} - {detail.leaveType}</Text>
                      {detail.carriedOverDays && <Text type="secondary"> (+{detail.carriedOverDays} days)</Text>}
                      {detail.message && <Text type="secondary"> - {detail.message}</Text>}
                      {detail.error && <Text type="danger"> - {detail.error}</Text>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
        width: 600
      });
      carryOverForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to carry over leave');
    }
  });

  const handleAllocateSingleUser = async (values: any) => {
    try {
      await allocateSingleMutation.mutateAsync({
        userId: values.userId,
        leaveTypeId: values.leaveTypeId,
        year: values.year,
        allocatedDays: values.allocatedDays,
        carriedOverDays: values.carriedOverDays || 0
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAllocateAllUsers = async (values: any) => {
    try {
      await allocateAllMutation.mutateAsync({
        leaveTypeId: values.leaveTypeId,
        year: values.year,
        allocatedDays: values.allocatedDays
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCarryOver = async (values: any) => {
    try {
      await carryOverMutation.mutateAsync({
        fromYear: values.fromYear,
        toYear: values.toYear
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoadingLeaveTypes || isUsersLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CalendarOutlined /> Leave Balance Management
      </Title>
      <Text type="secondary">
        Manage leave allocations and carry-over for employees
      </Text>

      <Divider />

      {/* Allocate to Single User */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Allocate Leave to Single User</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Alert
          message="Allocate leave balance to a specific user for a given year"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Form
          form={singleUserForm}
          layout="vertical"
          onFinish={handleAllocateSingleUser}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="userId"
                label="User"
                rules={[{ required: true, message: 'Please select a user' }]}
              >
                <Select
                  placeholder="Select user"
                  showSearch
                  filterOption={(input, option: any) => {
                    const label = option?.children?.toString() || '';
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {users.map((user: any) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="leaveTypeId"
                label="Leave Type"
                rules={[{ required: true, message: 'Please select leave type' }]}
              >
                <Select 
                  placeholder="Select leave type"
                  showSearch
                  optionFilterProp="children"
                >
                  {leaveTypes.map((type: any) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="year"
                label="Year"
                rules={[{ required: true, message: 'Please enter year' }]}
                initialValue={currentYear}
              >
                <InputNumber
                  placeholder="2025"
                  min={2024}
                  max={2050}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="allocatedDays"
                label="Allocated Days"
                rules={[{ required: true, message: 'Please enter days' }]}
              >
                <InputNumber
                  placeholder="20"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item
                name="carriedOverDays"
                label="Carried Over (Optional)"
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={allocateSingleMutation.isPending}
            >
              Allocate to User
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Allocate to All Users */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Allocate Leave to All Users</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Alert
          message="Allocate leave balance to all active users in the system"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Form
          form={allUsersForm}
          layout="inline"
          onFinish={handleAllocateAllUsers}
        >
          <Form.Item
            name="leaveTypeId"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select leave type' }]}
          >
            <Select placeholder="Select leave type" style={{ width: 200 }}>
              {leaveTypes.map((type: any) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: 'Please enter year' }]}
            initialValue={currentYear}
          >
            <InputNumber placeholder="2025" min={2024} max={2050} />
          </Form.Item>
          <Form.Item
            name="allocatedDays"
            label="Allocated Days"
            rules={[{ required: true, message: 'Please enter days' }]}
          >
            <InputNumber placeholder="20" min={0} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<TeamOutlined />}
              loading={allocateAllMutation.isPending}
              danger
            >
              Allocate to All Users
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Carry Over Leave */}
      <Card
        title={
          <Space>
            <SwapOutlined />
            <span>Carry Over Leave</span>
          </Space>
        }
      >
        <Alert
          message="Transfer unused leave balance from previous year to current year for all eligible leave types"
          description="This will only carry over leave types that have 'allowCarryOver' enabled, respecting the maximum carry-over limits."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Form
          form={carryOverForm}
          layout="inline"
          onFinish={handleCarryOver}
        >
          <Form.Item
            name="fromYear"
            label="From Year"
            rules={[{ required: true, message: 'Please enter year' }]}
            initialValue={currentYear - 1}
          >
            <InputNumber placeholder="2024" min={2024} max={2050} />
          </Form.Item>
          <Form.Item
            name="toYear"
            label="To Year"
            rules={[{ required: true, message: 'Please enter year' }]}
            initialValue={currentYear}
          >
            <InputNumber placeholder="2025" min={2024} max={2050} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SwapOutlined />}
              loading={carryOverMutation.isPending}
            >
              Execute Carry Over
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Alert
          message="Instructions"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>This process will carry over unused leave from the selected previous year to the new year</li>
              <li>Only leave types with "Allow Carry Over" enabled will be processed</li>
              <li>Maximum carry-over limits will be respected</li>
              <li>The process will skip users who have no balance or no remaining days</li>
              <li>You will receive a detailed report after completion</li>
            </ul>
          }
          type="warning"
          showIcon
        />
      </Card>
    </div>
  );
};

export default LeaveBalanceManagement;
