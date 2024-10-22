import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import PageTitle from '@/components/PageTitle';

interface Role {
  createdAt: string;
  name: string;
  description: string;
}

const RolesTable: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRole, setEditingRole] = useState<Role | null>(null);


  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: ( record: Role) => (
        <span>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
            style={{ marginRight: 8 }} 
          />
          <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} style={{ marginRight: 8 }} />
          </Popconfirm>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => handlePermissionModify(record)} 
          />
        </span>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return (
      <Alert message="Error fetching roles" description={error} type="error" showIcon />
    );
  }

  return (
    <div>
      <PageTitle title="Roles" />
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Create Role
      </Button>
      <Table
        dataSource={roles}
        columns={columns}
        rowKey="name"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingRole ? "Edit Role" : "Create Role"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingRole(null);
        }}
        footer={null}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={editingRole ? handleCreate : handleCreate}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the role name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRole ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesTable;
