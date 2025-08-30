import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  message,
  Space,
  Popconfirm,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from "../../hooks/leaveType/useLeaveType";
import { LeaveTypeType } from "../../types/leaveType";

const { Title } = Typography;

const LeaveTypeManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveTypeType | null>(null);
  const [form] = Form.useForm();

  const { data: leaveTypes, isLoading } = useLeaveTypes();
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();
  const deleteMutation = useDeleteLeaveType();

  const handleSubmit = async (values: any) => {
    try {
      if (editingLeaveType) {
        await updateMutation.mutateAsync({
          id: editingLeaveType.id,
          payload: values,
        });
        message.success("Leave type updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Leave type created successfully");
      }
      setIsModalOpen(false);
      setEditingLeaveType(null);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save leave type");
    }
  };

  const handleEdit = (leaveType: LeaveTypeType) => {
    setEditingLeaveType(leaveType);
    form.setFieldsValue(leaveType);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Leave type deleted successfully");
    } catch (error) {
      message.error("Failed to delete leave type");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: LeaveTypeType) => (
        <div className="flex items-center gap-2">
          <span className={record.isActive ? "text-gray-900" : "text-gray-400"}>
            {text}
          </span>
          {!record.isActive && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Max Days/Year",
      dataIndex: "maxDaysPerYear",
      key: "maxDaysPerYear",
      render: (days: number | null) => days ? `${days} days` : "Unlimited",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 text-xs rounded ${
          isActive 
            ? "bg-green-100 text-green-700" 
            : "bg-gray-100 text-gray-500"
        }`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: LeaveTypeType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-700"
          />
          <Popconfirm
            title="Are you sure you want to delete this leave type?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-700"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <SettingOutlined className="text-2xl text-blue-500" />
          <Title level={2} className="m-0">Leave Type Management</Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Add Leave Type
        </Button>
      </div>

      <Card>
        <Table
          dataSource={leaveTypes}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leave types`,
          }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-blue-500" />
            <span>{editingLeaveType ? "Edit Leave Type" : "Add Leave Type"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingLeaveType(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="name"
            label="Leave Type Name"
            rules={[
              { required: true, message: "Please enter leave type name" },
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
          >
            <Input
              placeholder="e.g., Annual Leave, Sick Leave"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="maxDaysPerYear"
            label="Maximum Days Per Year"
            tooltip="Leave blank for unlimited days"
          >
            <InputNumber
              placeholder="e.g., 21"
              size="large"
              className="w-full"
              min={1}
              max={365}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingLeaveType(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {editingLeaveType ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveTypeManager;
