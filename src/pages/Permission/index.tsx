import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Table, Alert, Button, Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

interface Permission {
  id: number;
  resource: string;
  description: string;
  path: string;
  method: string;
}

interface ApiResponse {
  results: Permission[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  next?: number;
  previous?: number;
}

interface ErrorResponse {
  message: string;
}

const PermissionTable: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchPermissions = async (page: number = currentPage, keywords: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`http://localhost:7777/permissions`, {
        params: { page, limit: pageSize, keywords },
      });
      setPermissions(response.data.results);
      setTotalItems(response.data.totalItems);
      setCurrentPage(page);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data.message || 'Error fetching permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number, size: number) => {
    setPageSize(size);
    fetchPermissions(page, '');
  };

  const handleCreatePermission = async (values: any) => {
    try {
      await axios.post('http://localhost:7777/permissions', values);
      form.resetFields();
      setModalVisible(false);
      fetchPermissions(currentPage, ''); // Refresh the list
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data.message || 'Error creating permission');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
  ];

  const expandedRowRender = (record: Permission) => (
    <div>
      <strong>Description:</strong> {record.description}
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert message={error} type="error" />;

  return (
    <>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Create Permission
      </Button>
      <Table
        dataSource={permissions}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          pageSizeOptions: ['10', '20', '100'],
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.description !== '',
          expandedRowKeys: expandedRow ? [expandedRow] : [],
          onExpand: (expanded, record) => {
            setExpandedRow(expanded ? record.id : null);
          },
        }}
      />

      <Modal
        title="Create Permission"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePermission}>
          <Form.Item name="resource" label="Resource" rules={[{ required: true, message: 'Please input the resource!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="path" label="Path" rules={[{ required: true, message: 'Please input the path!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true, message: 'Please select a method!' }]}>
            <Select>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PermissionTable;
