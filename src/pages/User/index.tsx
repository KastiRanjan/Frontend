import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import PageTitle from "@/components/PageTitle";

interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
  name: string;
  avatar: string | null;
  status: string;
  isTwoFAEnabled: boolean;
  role: UserRole;
}

const { Title } = Typography;
const { Option } = Select;

axios.defaults.withCredentials = true;

const User: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:7777/users");
      setUsers(response.data.results);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:7777/roles");
      setRoles(response.data.results);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      await axios.post("http://localhost:7777/users", {
        name: values.name,
        email: values.email,
        username: values.username,
        status: values.status,
        roleId: values.roleId, // Send the selected role ID
      });
      fetchUsers();
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => role.name,
    },
  ];

  return (
    <>
      <PageTitle title="Users" />

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "No users found." }}
        />
      )}
      <Modal
        title="Add User"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the user name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the user email!" },
              { type: "email", message: "Invalid email!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please input the user username!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: "Please select the user status!" },
            ]}
          >
            <Select placeholder="Select a status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="blocked">Blocked</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select a role">
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default User;
