// src/ProjectDetail.tsx
import React from 'react';
import { Card, Col, Row, Typography, Table } from 'antd';
import { Project } from '@/pages/Project/type';

const { Title, Text } = Typography;


interface ProjectDetailProps {
  project: Project;
}

const ProjectDetailComponent: React.FC<ProjectDetailProps> = ({ project , id}) => {
  const { name, description, startingDate, endingDate, users, tasks } = project;

  const userColumns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const taskColumns = [
    { title: 'Task Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    { title: 'Assignees', dataIndex: 'assignees', key: 'assignees' },
  ];

  return (
    <Card style={{ margin: '20px' }}>
      <Title level={2}>{name}</Title>
      <Text>{description}</Text>
      <Row style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Text strong>Starting Date:</Text> {new Date(startingDate).toLocaleDateString()}
        </Col>
        <Col span={12}>
          <Text strong>Ending Date:</Text> {new Date(endingDate).toLocaleDateString()}
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: '20px' }}>Users</Title>
      <Table dataSource={users} columns={userColumns} rowKey="username" />

      <Title level={4} style={{ marginTop: '20px' }}>Tasks</Title>
      <Table dataSource={tasks} columns={taskColumns} rowKey="name" />
    </Card>
  );
};

export default ProjectDetailComponent;
