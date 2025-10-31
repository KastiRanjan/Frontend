import React, { useState, useRef } from 'react';
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
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
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
  
  // For search functionality
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);
  
  // For sorting
  const [sortedInfo, setSortedInfo] = useState<any>({});

  // Queries and mutations
  const { data: leaveTypes, isLoading } = useLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();
  const toggleStatusMutation = useToggleLeaveTypeStatus();

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText('');
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const getColumnSearchProps = (dataIndex: string, title: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: any) => {
      if (dataIndex.includes('.')) {
        const keys = dataIndex.split('.');
        let nestedObj = record;
        for (const key of keys) {
          if (!nestedObj || !nestedObj[key]) return false;
          nestedObj = nestedObj[key];
        }
        return nestedObj.toString().toLowerCase().includes(value.toLowerCase());
      }
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

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
      isEmergency: leaveType.isEmergency || false,
      allowCarryOver: leaveType.allowCarryOver || false,
      maxCarryOverDays: leaveType.maxCarryOverDays,
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
      ...getColumnSearchProps('name', 'Name'),
      sorter: (a: LeaveType, b: LeaveType) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
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
      ...getColumnSearchProps('description', 'Description'),
      sorter: (a: LeaveType, b: LeaveType) => (a.description || '').localeCompare(b.description || ''),
      sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order,
      render: (text: string) => text || '-',
    },
    {
      title: 'Max Days/Year',
      dataIndex: 'maxDaysPerYear',
      key: 'maxDaysPerYear',
      sorter: (a: LeaveType, b: LeaveType) => (a.maxDaysPerYear || 0) - (b.maxDaysPerYear || 0),
      sortOrder: sortedInfo.columnKey === 'maxDaysPerYear' && sortedInfo.order,
      render: (value: number) => value ? `${value} days` : 'Unlimited',
    },
    {
      title: 'Emergency',
      dataIndex: 'isEmergency',
      key: 'isEmergency',
      render: (value: boolean) => value ? <Tag color="orange">Emergency</Tag> : <Tag>Regular</Tag>,
    },
    {
      title: 'Carry Over',
      dataIndex: 'allowCarryOver',
      key: 'allowCarryOver',
      render: (value: boolean, record: LeaveType) => {
        if (!value) return <Tag>No</Tag>;
        return (
          <Space direction="vertical" size={0}>
            <Tag color="green">Yes</Tag>
            {record.maxCarryOverDays && (
              <span style={{ fontSize: '11px' }}>Max: {record.maxCarryOverDays}</span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: (a: LeaveType, b: LeaveType) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
      sortOrder: sortedInfo.columnKey === 'isActive' && sortedInfo.order,
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
        columns={columns as any}
        dataSource={leaveTypes || []}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
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
            isEmergency: false,
            allowCarryOver: false,
            maxCarryOverDays: null,
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

          <Form.Item
            label="Emergency Leave"
            name="isEmergency"
            valuePropName="checked"
            help="Emergency leaves can be requested for today"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Allow Carry Over"
            name="allowCarryOver"
            valuePropName="checked"
            help="Allow unused leave to carry over to next year"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.allowCarryOver !== currentValues.allowCarryOver
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('allowCarryOver') ? (
                <Form.Item
                  label="Maximum Carry Over Days"
                  name="maxCarryOverDays"
                  help="Leave blank for unlimited carry over"
                >
                  <InputNumber
                    min={1}
                    max={365}
                    placeholder="e.g., 5"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ) : null
            }
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
