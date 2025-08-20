// src/ProjectDetail.tsx
import { ProjectType } from '@/types/project';
import { Button, Card, Col, Modal, Row, Space, Tabs, Typography } from 'antd';
import TaskTable from '../Task/TaskTable';
import TaskForm from '../Task/TaskForm';
import { useState } from 'react';
import ProjectSummary from './ProjectSummary';
import ProjectUserCard from './ProjectUserCard';
import ProjectTimeline from './ProjectTimeline';

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
      <Col span={24}> {/* Changed from span={16} to span={24} */}
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
              children: <div>Project Details Content</div>
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
                  id={project.id?.toString()}
                  users={project.users?.map(user => user)}
                  projectLead={project.projectLead}
                  onRefresh={() => {
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
              label: 'Timeline',
              key: '5',
              children: <ProjectTimeline projectId={project.id} />
            },
          ]} />
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectDetailComponent;