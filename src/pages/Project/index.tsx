import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Table, Typography, Spin, Alert, Button, Modal, Form, Input, DatePicker, Select } from 'antd';

const { Header, Content } = Layout;
const { Title} = Typography;
const { Option } = Select;

// Define interfaces for Project, User, and Task types
interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'suspended' | 'archived' | 'signed_off';
  natureOfWork: 'external_audit' | 'tax_compliance' | 'accounts_review' | 'legal_services' | 'financial_projection' | 'valuation' | 'internal_audit' | 'others';
  fiscalYear: number;
  startingDate: string;
  endingDate: string;
  users: User[];
  tasks: Task[];
}

// Custom Hook to Fetch Projects
const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Project[]>('http://localhost:7777/projects');
      setProjects(response.data);
    } catch (error) {
      setError('Error fetching projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, fetchProjects };
};

// Custom Hook to Fetch Users
const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ results: User[] }>('http://localhost:7777/users');
      setUsers(response.data.results); // Access the results array
    } catch (error) {
      setError('Error fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error };
};

axios.defaults.withCredentials = true;

// Main Component
const ProjectsList: React.FC = () => {
  const { projects, loading, error, fetchProjects } = useProjects();
  const { users, loading: loadingUsers, error: errorUsers } = useUsers();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const showProfile = (user: User) => {
    setSelectedUser(user);
  };

  const handleAddProject = async (values: any) => {
    try {
      await axios.post('http://localhost:7777/projects', {
        ...values,
        fiscalYear: parseInt(values.fiscalYear, 10),
        users: values.users || [],
      });
      fetchProjects();
      setVisible(false);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const columns = [
    {
      title: <span className="custom-header">Project Name</span>,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: <span className="custom-header">Description</span>,
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: <span className="custom-header">Status</span>,
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: <span className="custom-header">Fiscal Year</span>,
      dataIndex: 'fiscalYear',
      key: 'fiscalYear',
    },
    {
      title: <span className="custom-header">Start Date</span>,
      dataIndex: 'startingDate',
      key: 'startingDate',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: <span className="custom-header">End Date</span>,
      dataIndex: 'endingDate',
      key: 'endingDate',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1890ff', borderRadius: '8px', color: '#fff' }}>
        <Title level={3} style={{ color: '#fff', margin: 0, padding: '15px' }}>Projects Overview</Title>
      </Header>
      <Content style={{ padding: '20px' }}>
        {loading && <Spin />}
        {error && <Alert message={error} type="error" showIcon />}
        {loadingUsers && <Spin />}
        {errorUsers && <Alert message={errorUsers} type="error" showIcon />}

        {!loading && !error && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Button type="primary" onClick={() => setVisible(true)}>
              + Add Project
            </Button>
          </div>
        )}

        {!loading && !error && (
          <Table
            dataSource={projects}
            columns={columns}
            rowKey="id"
            expandable={{
              expandedRowRender: (record: Project) => (
                <>
                  <Title level={4}>Users</Title>
                  <Table
                    dataSource={record.users}
                    columns={[
                      {
                        title: 'User Name',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email',
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                      },
                      {
                        title: 'Actions',
                        key: 'action',
                        render: (_, user: User) => (
                          <Button type="primary" onClick={() => showProfile(user)}>View Profile</Button>
                        ),
                      },
                    ]}
                    rowKey="id"
                  />
                  <Title level={4}>Tasks</Title>
                  <Table
                    dataSource={record.tasks}
                    columns={[
                      {
                        title: 'Task Name',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description',
                      },
                      {
                        title: 'Due Date',
                        dataIndex: 'dueDate',
                        key: 'dueDate',
                        render: (text: string) => new Date(text).toLocaleDateString(),
                      },
                    ]}
                    rowKey="id"
                  />
                </>
              ),
            }}
            pagination={{ position: ['bottomRight'] }}
            className="custom-table"
          />
        )}
      </Content>
      <Modal
        title="Add New Project"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddProject}>
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please input the project name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="archived">Archived</Option>
              <Option value="signed_off">Signed Off</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Nature of Work"
            name="natureOfWork"
            rules={[{ required: true, message: 'Please select the nature of work!' }]}
          >
            <Select placeholder="Select nature of work">
              <Option value="external_audit">External Audit</Option>
              <Option value="tax_compliance">Tax Compliance</Option>
              <Option value="accounts_review">Accounts Review</Option>
              <Option value="legal_services">Legal Services</Option>
              <Option value="financial_projection">Financial Projection</Option>
              <Option value="valuation">Valuation</Option>
              <Option value="internal_audit">Internal Audit</Option>
              <Option value="others">Others</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Fiscal Year"
            name="fiscalYear"
            rules={[{ required: true, message: 'Please select the fiscal year!' }]}
          >
            <Select placeholder="Select fiscal year">
              {[...Array(5).keys()].map((_, index) => {
                const year = new Date().getFullYear() + index;
                return <Option key={year} value={year}>{year}</Option>;
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="Starting Date"
            name="startingDate"
            rules={[{ required: true, message: 'Please select the starting date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Ending Date"
            name="endingDate"
            rules={[{ required: true, message: 'Please select the ending date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Assign Users"
            name="users"
          >
            <Select mode="multiple" placeholder="Select users">
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Add Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Profile Modal */}
      {selectedUser && (
        <Modal
          title="User Profile"
          open={!!selectedUser}
          onCancel={() => setSelectedUser(null)}
          footer={null}
        >
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Status:</strong> {selectedUser.status}</p>
          {/* Add more user details as needed */}
        </Modal>
      )}
    </Layout>
  );
};

export default ProjectsList;
