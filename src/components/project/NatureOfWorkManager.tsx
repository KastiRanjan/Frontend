
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import {
  fetchNatureOfWorks,
  createNatureOfWork,
  updateNatureOfWork,
  deleteNatureOfWork,
} from "@/service/natureOfWork.service";

interface NatureOfWork {
  id: string;
  name: string;
  shortName: string;
}

const NatureOfWorkManager: React.FC = () => {
  const [data, setData] = useState<NatureOfWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<NatureOfWork | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchNatureOfWorks();
      setData(res);
    } catch (err) {
      message.error("Failed to fetch data");
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

  const handleEdit = (record: NatureOfWork) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNatureOfWork(id);
      message.success("Deleted successfully");
      fetchData();
    } catch {
      message.error("Delete failed");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateNatureOfWork(editing.id, values);
        message.success("Updated successfully");
      } else {
        await createNatureOfWork(values);
        message.success("Added successfully");
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
      render: (_: any, record: NatureOfWork) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
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
        Add Nature of Work
      </Button>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />
      <Modal
        title={editing ? "Edit Nature of Work" : "Add Nature of Work"}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shortName" label="Short Name" rules={[{ required: true, message: "Please input short name" }]}> 
            <Input maxLength={10} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default NatureOfWorkManager;
