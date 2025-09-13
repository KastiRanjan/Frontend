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
import ProjectDetails from './ProjectDetails';
import { useQueryClient } from '@tanstack/react-query';



interface ProjectDetailProps {
  project: ProjectType;
  loading?: boolean;
}


const ProjectDetailComponent = ({ project, loading }: ProjectDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { profile } = useSession();
  const queryClient = useQueryClient();
  
  // Support both { name } and { permission } in role
  const userRole = (profile?.role && 'name' in profile.role && typeof profile.role.name === 'string')
    ? profile.role.name.toLowerCase()
    : undefined;
  const hideAddTask = userRole === 'auditsenior' || userRole === 'auditjunior';

  // Add null checks for project data
  const tasks = project?.tasks;
  const users = project?.users;
  const name = project?.name;

  // Don't render if project is not loaded yet
  if (!project && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading project details...
      </div>
    );
  }

  // If project is null and not loading, show error
  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Project not found
      </div>
    );
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const showModal = (task?: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskFormSuccess = () => {
    // Close modal and refresh data
    setIsModalOpen(false);
    setSelectedTask(null);
    handleRefresh();
  };

  // Function to refresh project data after task operations
  const handleRefresh = () => {
    // Only invalidate if we have a project ID
    if (project?.id) {
      queryClient.invalidateQueries({ queryKey: ["project", project.id.toString()] });
    }
    // Also invalidate tasks queries if they exist
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    console.log("Refreshing project data...");
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
              projectId={project?.id?.toString?.() ?? String(project?.id ?? '')}
              onSuccess={handleRefresh}
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
              children: <ProjectDetails project={project} />
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
                      id: project?.id?.toString?.() ?? String(project?.id ?? ''),
                      users: (project?.users ?? []).map(user => ({ ...user, id: user.id ?? 0 })) as any,
                      projectLead: project?.projectLead ? { ...project.projectLead, id: project.projectLead.id ?? 0 } as any : { id: 0, name: '', username: '', email: '' }
                    }}
                    onRefresh={handleRefresh}
                    loading={loading}
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
              children: <ProjectTimeline projectId={project?.id} />
            },
          ]} />
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectDetailComponent;