import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Typography,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { 
  useWorkhours, 
  useCreateWorkhour, 
  useUpdateWorkhour, 
  useDeleteWorkhour 
} from '../../hooks/workhour/useWorkhour';
import { CreateWorkhourDto, UpdateWorkhourDto, WorkhourType } from '../../types/workhour';

const { Title } = Typography;
const { Option } = Select;

interface WorkhourSettingsProps {
  users?: any[];
  roles?: any[];
}

const WorkhourSettings: React.FC<WorkhourSettingsProps> = ({ users = [], roles = [] }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkhourType | null>(null);
  const [form] = Form.useForm();

  // Hooks
  const { data: workhours = [], isLoading, refetch } = useWorkhours();
  const createWorkhour = useCreateWorkhour();
  const updateWorkhour = useUpdateWorkhour();
  const deleteWorkhour = useDeleteWorkhour();

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: WorkhourType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      userId: record.userId,
      roleId: record.roleId,
      workHours: record.workHours,
      startTime: record.startTime,
      endTime: record.endTime
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorkhour.mutateAsync(id);
      message.success('Work hour configuration deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete work hour configuration');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: CreateWorkhourDto | UpdateWorkhourDto = {
        userId: values.userId || undefined,
        roleId: values.roleId || undefined,
        workHours: values.workHours,
        startTime: values.startTime,
        endTime: values.endTime
      };

      if (editingRecord) {
        await updateWorkhour.mutateAsync({ 
          id: editingRecord.id, 
          payload: payload as UpdateWorkhourDto 
        });
        message.success('Work hour configuration updated successfully');
      } else {
        await createWorkhour.mutateAsync(payload as CreateWorkhourDto);
        message.success('Work hour configuration created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error('Failed to save work hour configuration');
    }
  };

  const getConfigurationType = (record: WorkhourType) => {
    if (record.userId) {
      const user = users.find(u => u.id === record.userId);
      return {
        type: 'User-specific',
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        color: '#52c41a',
        icon: <UserOutlined />
      };
    } else if (record.roleId) {
      const role = roles.find(r => r.id === record.roleId);
      return {
        type: 'Role-based',
        name: role ? role.name : 'Unknown Role',
        color: '#1890ff',
        icon: <TeamOutlined />
      };
    }
    return {
      type: 'General',
      name: 'Default',
      color: '#faad14',
      icon: <SettingOutlined />
    };
  };

  const columns = [
    {
      title: 'Configuration Type',
      key: 'type',
      render: (_: any, record: WorkhourType) => {
        const config = getConfigurationType(record);
        return (
          <Space>
            {config.icon}
            <div>
              <Tag color={config.color}>{config.type}</Tag>
              <br />
              <span>{config.name}</span>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Work Hours',
      dataIndex: 'workHours',
      key: 'workHours',
      render: (hours: number) => <strong>{hours}h</strong>
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => time || 'Not set'
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => time || 'Not set'
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkhourType) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this configuration?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            <Title level={4} style={{ margin: 0 }}>Work Hour Settings</Title>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Add Configuration
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={workhours}
        rowKey="id"
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} configurations`
        }}
      />

      <Modal
        title={editingRecord ? 'Edit Work Hour Configuration' : 'Add Work Hour Configuration'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="configurationType"
            label="Configuration Type"
            required
          >
            <Select placeholder="Select configuration type">
              <Option value="user">User-specific</Option>
              <Option value="role">Role-based</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.configurationType !== currentValues.configurationType
            }
          >
            {({ getFieldValue }) => {
              const configType = getFieldValue('configurationType');
              
              if (configType === 'user') {
                return (
                  <Form.Item
                    name="userId"
                    label="User"
                    rules={[{ required: true, message: 'Please select a user' }]}
                  >
                    <Select placeholder="Select user" showSearch>
                      {users.map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              if (configType === 'role') {
                return (
                  <Form.Item
                    name="roleId"
                    label="Role"
                    rules={[{ required: true, message: 'Please select a role' }]}
                  >
                    <Select placeholder="Select role">
                      {roles.map(role => (
                        <Option key={role.id} value={role.id}>
                          {role.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="workHours"
            label="Daily Work Hours"
            rules={[
              { required: true, message: 'Please enter work hours' },
              { type: 'number', min: 1, max: 24, message: 'Work hours must be between 1 and 24' }
            ]}
          >
            <InputNumber 
              placeholder="8" 
              style={{ width: '100%' }}
              min={1}
              max={24}
              step={0.5}
              addonAfter="hours"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startTime"
              label="Start Time (Optional)"
              style={{ flex: 1 }}
            >
              <Input placeholder="09:00" />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="End Time (Optional)"
              style={{ flex: 1 }}
            >
              <Input placeholder="17:00" />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createWorkhour.isPending || updateWorkhour.isPending}
              >
                {editingRecord ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkhourSettings;
