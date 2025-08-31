import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
  useToggleLeaveTypeStatus,
} from '../hooks/useLeaveTypes';
import { LeaveType, CreateLeaveTypeDto, UpdateLeaveTypeDto } from '../service/leaveTypeService';

const LeaveTypeManager: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [form] = Form.useForm();

  // Queries and mutations
  const { data: leaveTypes, isLoading } = useLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();
  const toggleStatusMutation = useToggleLeaveTypeStatus();

  const handleCreateEdit = () => {
    setEditingLeaveType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    form.setFieldsValue({
      name: leaveType.name,
      description: leaveType.description,
      maxDaysPerYear: leaveType.maxDaysPerYear,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: CreateLeaveTypeDto) => {
    try {
      if (editingLeaveType) {
        await updateMutation.mutateAsync({
          id: editingLeaveType.id,
          data: values as UpdateLeaveTypeDto,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingLeaveType(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, isActive });
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LeaveType) => (
        <Space>
          <span>{text}</span>
          {!record.isActive && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Max Days/Year',
      dataIndex: 'maxDaysPerYear',
      key: 'maxDaysPerYear',
      render: (value: number) => value ? `${value} days` : 'Unlimited',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: LeaveType) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          loading={toggleStatusMutation.isPending}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveType) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={updateMutation.isPending}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this leave type?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateEdit}
          loading={createMutation.isPending}
        >
          Add Leave Type
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={leaveTypes || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title={editingLeaveType ? 'Edit Leave Type' : 'Create Leave Type'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingLeaveType(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            maxDaysPerYear: null,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter leave type name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must not exceed 100 characters' },
            ]}
          >
            <Input placeholder="e.g., Annual Leave, Sick Leave" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description must not exceed 500 characters' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional description of this leave type"
            />
          </Form.Item>

          <Form.Item
            label="Maximum Days Per Year"
            name="maxDaysPerYear"
            help="Leave blank for unlimited leave days"
          >
            <InputNumber
              min={1}
              max={365}
              placeholder="e.g., 30"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingLeaveType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingLeaveType ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveTypeManager;
