import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department
} from "@/service/department.service";

const DepartmentManager: React.FC = () => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchDepartments();
      setData(res);
    } catch (err) {
      message.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Department) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      message.success("Department deleted successfully");
      fetchData();
    } catch {
      message.error("Failed to delete department");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateDepartment(editing.id, values);
        message.success("Department updated successfully");
      } else {
        await createDepartment(values);
        message.success("Department added successfully");
      }
      setModalVisible(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch {
      // validation or API error
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Short Name", dataIndex: "shortName", key: "shortName" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Department) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure you want to delete this department?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Add Department
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />
      <Modal
        title={editing ? "Edit Department" : "Add Department"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter department name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortName" label="Short Name" rules={[{ required: true, message: "Please enter short name" }]}> 
            <Input maxLength={10} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DepartmentManager;