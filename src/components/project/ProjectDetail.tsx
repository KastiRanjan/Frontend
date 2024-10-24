// src/ProjectDetail.tsx
import React from 'react';
import { Card, Col, Row, Typography, Table, Button } from 'antd';
import { Project } from '@/pages/Project/type';
import PageTitle from '../PageTitle';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;


interface ProjectDetailProps {
  project: Project;
}

const ProjectDetailComponent: React.FC<ProjectDetailProps> = ({ project , id}) => {
  const { name, description, startingDate, endingDate, users, tasks } = project;
  const navigate = useNavigate();


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
    <>
    <Title level={2}>{name}</Title>
    <Card style={{ margin: '20px' }}>
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
      <Button type="primary" style={{ marginTop: '20px' }} onClick={() => navigate(`/project/${id}/tasks`)}>Add Task</Button>
    </Card>
    </>
  );
};

export default ProjectDetailComponent;
