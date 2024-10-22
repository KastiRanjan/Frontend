// src/components/TaskGroups.tsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Form,
  Input,
  Button,
  Modal,
} from "antd";
import {
  FileTextOutlined,
  DownOutlined,
  UpOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import PageTitle from "@/components/PageTitle";

const { Title, Paragraph } = Typography;

interface TaskTemplate {
  id: number;
  name: string;
  description: string;
}

interface TaskGroup {
  id: number;
  name: string;
  description: string;
  tasktemplate: TaskTemplate[];
}

const TaskGroups: React.FC = () => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<TaskGroup | null>(null);
  const [form] = Form.useForm();
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  useEffect(() => {
    fetchTaskGroups();
  }, []);

  const fetchTaskGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:7777/task-groups");
      setTaskGroups(response.data);
    } catch (error) {
      console.error("Error fetching task groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (id: number) => {
    setExpandedGroup(expandedGroup === id ? null : id);
  };

  const showCreateModal = () => {
    setVisible(true);
  };

  const showEditModal = (group: TaskGroup) => {
    setCurrentGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setEditVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setEditVisible(false);
    setCurrentGroup(null);
  };

  const handleFinish = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      if (currentGroup) {
        // Update task group
        await axios.put(
          `http://localhost:7777/task-groups/${currentGroup.id}`,
          values
        );
      } else {
        // Create new task group
        await axios.post("http://localhost:7777/task-groups", values);
      }
      form.resetFields();
      fetchTaskGroups(); // Refresh task groups
      handleCancel();
    } catch (error) {
      console.error("Error saving task group:", error);
    }
  };

  useEffect(() => {
    if (taskGroups.length > 0) {
      const cardElement = document.getElementById(
        `task-group-${taskGroups[0].id}`
      );
      if (cardElement) {
        setCardHeight(cardElement.clientHeight);
      }
    }
  }, [taskGroups]);

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  }

  return (
    <>
      <PageTitle title="Task Group" />

      <Row gutter={16}>
        {taskGroups.map((group) => (
          <Col span={8} key={group.id}>
            <Card
              id={`task-group-${group.id}`}
              bordered={false}
              hoverable
              style={{
                marginBottom: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, background-color 0.2s",
                backgroundColor:
                  expandedGroup === group.id ? "#e6f7ff" : "#fff",
              }}
              onClick={() => toggleGroup(group.id)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f9ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  expandedGroup === group.id ? "#e6f7ff" : "#fff")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#1890ff" }}>
                  <FileTextOutlined /> {group.name}
                </span>
                {expandedGroup === group.id ? (
                  <UpOutlined style={{ color: "#1890ff" }} />
                ) : (
                  <DownOutlined style={{ color: "#999" }} />
                )}
              </div>
              <Paragraph
                style={{ fontStyle: "italic", color: "#555", margin: "10px 0" }}
              >
                {group.description}
              </Paragraph>
              {expandedGroup === group.id && (
                <>
                  <Title level={4} style={{ marginTop: "10px", color: "#333" }}>
                    Task Templates
                  </Title>
                  {group.tasktemplate.length > 0 ? (
                    <ul style={{ paddingLeft: "20px" }}>
                      {group.tasktemplate.map((task) => (
                        <li
                          key={task.id}
                          style={{ marginBottom: "8px", color: "#555" }}
                        >
                          <strong>{task.name}</strong>: {task.description}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Paragraph>No tasks available</Paragraph>
                  )}
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ marginTop: "10px" }}
                    onClick={() => showEditModal(group)}
                  ></Button>
                </>
              )}
            </Card>
          </Col>
        ))}
        {/* Create Task Group Card */}
        <Col span={8}>
          <Card
            bordered={false}
            hoverable
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: cardHeight ? `${cardHeight}px` : "auto",
              transition: "transform 0.2s, background-color 0.2s",
            }}
            onClick={showCreateModal}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f9ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fff")
            }
          >
            <Title level={4} style={{ margin: "10px 0", color: "#1890ff" }}>
              + Create Task Group
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Create Task Group Modal */}
      <Modal
        title={currentGroup ? "Edit Task Group" : "Create Task Group"}
        visible={visible || editVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Task Group Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the task group name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentGroup ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TaskGroups;
