// src/ProjectDetail.tsx
import { ProjectType } from '@/types/project';
import { Button, Card, Col, Modal, Row, Space, Tabs, Typography } from 'antd';
import TaskTable from '../Task/TaskTable';
import { useProjectTask } from '@/hooks/task/useProjectTask';
import ProjectSummary from './ProjectSummary';
import { useState } from 'react';
import TaskForm from '../Task/TaskForm';
import User from '@/pages/User';
import ProjectUserCard from './ProjectUserCard';

const { Title, Text } = Typography;


interface ProjectDetailProps {
  project: ProjectType;
}

const ProjectDetailComponent = ({ project}: ProjectDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => setIsModalOpen(false);

  const tasks = project?.tasks;
  const users = project?.users;




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
    <Row gutter={8}>
    {isModalOpen && (
        <Modal title="Add Task" footer={null} open={isModalOpen} onCancel={handleCancel}>
          <div className="max-h-[70vh] overflow-y-scroll">
            <TaskForm  users={project?.users} tasks={project?.tasks} handleCancel={handleCancel} />
          </div>
        </Modal>
      )}
      <Col span={16}>
        <Card title={name} extra={<Button onClick={() =>setIsModalOpen(true)}>Add Task</Button>}>
          <Tabs defaultActiveKey="1" items={[
            {
              label: 'Summary', key: '1',
              children: <ProjectSummary />
            },
            {
              label: 'Details', key: '2',
            },
            {
              label: 'Tasks', key: '3',
              children: <><TaskTable data={tasks} showModal={isModalOpen} /></>
            },
            {
              label: 'Members', key: '4',
              children: <><ProjectUserCard data={users}/></>
            },
            {
              label: 'Time Sheet', key: '5',
            },
          ]}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Project Id</Text></Col>
            <Col><Text>{project?.id}</Text></Col>
          </Row>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Status</Text></Col>
            <Col><Text >{project?.status}</Text></Col>
          </Row>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Project Lead</Text></Col>
            <Col><Text >{project?.projectLead?.name}</Text></Col>
          </Row>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Due Date</Text></Col>
            <Col><Text >{project?.endingDate}</Text></Col>
          </Row>
          <div className='py-3'>
            <Title level={5}>MY TASKS</Title>
            <Row gutter={16} className='py-1'>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>{project?.tasks?.length}</Title>
                  <Text>Total</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>{project?.tasks?.filter(task => task.status === "in_progress").length}</Title>
                  <Text>Pending</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>{project?.tasks?.filter(task => task.status === "done").length}</Title>
                  <Text>Completed</Text>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectDetailComponent;
