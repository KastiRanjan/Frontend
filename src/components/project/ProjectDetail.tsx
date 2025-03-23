// src/ProjectDetail.tsx
import { ProjectType } from '@/types/project';
import { Button, Card, Col, Modal, Row, Space, Tabs, Typography } from 'antd';
import TaskTable from '../Task/TaskTable';
import TaskForm from '../Task/TaskForm';
import { useState } from 'react';
import ProjectSummary from './ProjectSummary';
import ProjectUserCard from './ProjectUserCard';

const { Title, Text } = Typography;

interface ProjectDetailProps {
  project: ProjectType;
}

const ProjectDetailComponent = ({ project }: ProjectDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const tasks = project?.tasks;
  const users = project?.users;
  const name = project?.name;

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const showModal = (task?: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <Row gutter={8}>
      {isModalOpen && (
        <Modal 
          title={selectedTask ? "Edit Task" : "Add Task"} 
          footer={null} 
          open={isModalOpen} 
          onCancel={handleCancel}
        >
          <div className="max-h-[70vh] overflow-y-scroll">
            <TaskForm
              users={project?.users}
              tasks={project?.tasks}
              editTaskData={selectedTask}
              handleCancel={handleCancel}
              projectId={project?.id}
            />
          </div>
        </Modal>
      )}
      <Col span={16}>
        <Card 
          title={name} 
          extra={<Button onClick={() => showModal()}>Add Task</Button>}
        >
          <Tabs defaultActiveKey="1" items={[
            {
              label: 'Summary',
              key: '1',
              children: <ProjectSummary />
            },
            {
              label: 'Details',
              key: '2',
              children: <div>Project Details Content</div> // Add your details content here
            },
            {
              label: 'Tasks',
              key: '3',
              children: (
                <TaskTable 
                  data={tasks || []}
                  showModal={showModal}
                  project={{
                    id: project.id?.toString(),
                    users: project.users?.map(user => user),
                    projectLead: project.projectLead
                  }}
                />
              )
            },
            {
              label: 'Members',
              key: '4',
              children: <ProjectUserCard data={users || []} />
            },
            {
              label: 'Time Sheet',
              key: '5',
              children: <div>Time Sheet Content</div> // Add your time sheet content here
            },
          ]} />
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
            <Col><Text>{project?.status}</Text></Col>
          </Row>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Project Lead</Text></Col>
            <Col><Text>{project?.projectLead?.name}</Text></Col>
          </Row>
          <Row gutter={16} className='py-1'>
            <Col flex="100px"><Text>Due Date</Text></Col>
            <Col><Text>{project?.endingDate}</Text></Col>
          </Row>
          <div className='py-3'>
            <Title level={5}>MY TASKS</Title>
            <Row gutter={16} className='py-1'>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>{project?.tasks?.length || 0}</Title>
                  <Text>Total</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>
                    {project?.tasks?.filter(task => task.status === "in_progress").length || 0}
                  </Title>
                  <Text>Pending</Text>
                </div>
              </Col>
              <Col span={8}>
                <div className='text-center'>
                  <Title level={5}>
                    {project?.tasks?.filter(task => task.status === "done").length || 0}
                  </Title>
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