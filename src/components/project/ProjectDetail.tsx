// src/ProjectDetail.tsx
import { ProjectType } from '@/types/project';
import { Button, Card, Col, Modal, Row, Space, Tabs, Typography } from 'antd';
import { useSession } from '@/context/SessionContext';
import TaskTable from '../Task/TaskTable';
import TaskForm from '../Task/TaskForm';
import { useState } from 'react';
import ProjectSummary from './ProjectSummary';
import ProjectUserCard from './ProjectUserCard';
import ProjectTimeline from './ProjectTimeline';



interface ProjectDetailProps {
  project: ProjectType;
}


const ProjectDetailComponent = ({ project }: ProjectDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { profile } = useSession();
  // Support both { name } and { permission } in role
  const userRole = (profile?.role && 'name' in profile.role && typeof profile.role.name === 'string')
    ? profile.role.name.toLowerCase()
    : undefined;
  const hideAddTask = userRole === 'auditsenior' || userRole === 'auditjunior';

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
              users={project?.users ?? []}
              tasks={project?.tasks ?? []}
              editTaskData={selectedTask}
              handleCancel={handleCancel}
              projectId={project?.id?.toString?.() ?? String(project?.id)}
            />
          </div>
        </Modal>
      )}
      <Col span={24}>
  <Card title={name ?? ''}>
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
                <>
                  {!hideAddTask && (
                    <Button type="primary" style={{ marginBottom: 16 }} onClick={() => showModal()}>
                      Add Task
                    </Button>
                  )}
                  <TaskTable 
                    data={tasks ?? []}
                    showModal={showModal}
                    project={{
                      id: project.id?.toString?.() ?? String(project.id),
                      users: project.users ?? [],
                      projectLead: project.projectLead ?? { id: '', name: '' }
                    }}
                    id={project.id?.toString?.() ?? String(project.id)}
                    users={project.users ?? []}
                    projectLead={project.projectLead ?? { id: '', name: '' }}
                    onRefresh={() => {}}
                  />
                </>
              )
            },
            {
              label: 'Members',
              key: '4',
              children: <ProjectUserCard data={(users ?? []).map(u => ({
                id: String(u.id ?? ''),
                avatar: u.avatar ?? '',
                name: u.name ?? '',
                email: u.email ?? ''
              }))} />
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