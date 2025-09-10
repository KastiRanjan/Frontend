import React from 'react';
import { Button, Form, Input, Modal, Table, Space, Switch, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { usePortalCredentials } from '@/hooks/client/usePortalCredentials';
import { useCreatePortalCredential } from '@/hooks/client/useCreatePortalCredential';
import { useUpdatePortalCredential } from '@/hooks/client/useUpdatePortalCredential';
import { useDeletePortalCredential } from '@/hooks/client/useDeletePortalCredential';

interface PortalCredentialFormProps {
  clientId: string;
  readOnly?: boolean;
}

const PortalCredentialsForm: React.FC<PortalCredentialFormProps> = ({ clientId, readOnly = false }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingCredential, setEditingCredential] = React.useState<any>(null);
  
  const { data: portalCredentials, isLoading } = usePortalCredentials(clientId);
  const createMutation = useCreatePortalCredential(clientId);
  const updateMutation = useUpdatePortalCredential(clientId, editingCredential?.id || '');
  const deleteMutation = useDeletePortalCredential(clientId);

  const showAddModal = () => {
    form.resetFields();
    setEditingCredential(null);
    setIsModalVisible(true);
  };

  const showEditModal = (record: any) => {
    form.setFieldsValue({
      portalName: record.portalName,
      loginUser: record.loginUser,
      password: record.password,
      website: record.website,
      description: record.description,
      status: record.status === 'active'
    });
    setEditingCredential(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const payload = {
        ...values,
        status: values.status ? 'active' : 'inactive'
      };
      
      if (editingCredential) {
        updateMutation.mutate(payload);
      } else {
        createMutation.mutate(payload);
      }
      
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (credentialId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this portal credential?',
      content: 'This action cannot be undone',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteMutation.mutate(credentialId);
      }
    });
  };

  const columns = [
    {
      title: 'Portal Name',
      dataIndex: 'portalName',
      key: 'portalName',
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (text: string) => text ? (
        <a href={text.startsWith('http') ? text : `http://${text}`} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ) : '-'
    },
    {
      title: 'Login User',
      dataIndex: 'loginUser',
      key: 'loginUser',
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      render: (_: string) => '••••••••••'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        !readOnly ? (
          <Space size="middle">
            <Tooltip title="Edit">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                size="small"
              />
            </Tooltip>
          </Space>
        ) : null
      ),
    },
  ];

  // If readOnly is true and there are no Actions to show, remove the column
  const displayColumns = readOnly ? columns.filter(col => col.key !== 'action') : columns;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>Web Portal Credentials</h3>
        {!readOnly && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Add Credential
          </Button>
        )}
      </div>

      <Table
        loading={isLoading}
        dataSource={portalCredentials || []}
        columns={displayColumns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingCredential ? "Edit Portal Credential" : "Add Portal Credential"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {editingCredential ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="portalName"
            label="Portal Name"
            rules={[{ required: true, message: 'Please enter portal name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="website"
            label="Portal Website"
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="loginUser"
            label="Login User"
            rules={[{ required: true, message: 'Please enter login user' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PortalCredentialsForm;
