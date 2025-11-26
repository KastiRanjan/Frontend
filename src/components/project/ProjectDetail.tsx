// src/ProjectDetail.tsx
import { ProjectType } from '@/types/project';
import { Button, Card, Col, Modal, Row, Tabs } from 'antd';
import { useSession } from '@/context/SessionContext';
import TaskTable from '../Task/TaskTable';
import TaskForm from '../Task/TaskForm';
import { useState, useMemo } from 'react';
import ProjectSummary from './ProjectSummary';
import ProjectUserCard from './ProjectUserCard';
import ProjectTimeline from './ProjectTimeline';
import ProjectDetails from './ProjectDetails';
import ProjectRanking from './ProjectRanking';
import ProjectBudget from './ProjectBudget';
import ProjectCompletionWorkflow from './ProjectCompletionWorkflow';
import { useQueryClient } from '@tanstack/react-query';
import ProjectUserAssignment from './ProjectUserAssignment';



interface ProjectDetailProps {
  project: ProjectType;
  loading?: boolean;
}


const ProjectDetailComponent = ({ project, loading }: ProjectDetailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { profile, permissions } = useSession();
  const queryClient = useQueryClient();
  
  // Support both { name } and { permission } in role
  const userRole = (profile?.role && 'name' in profile.role && typeof profile.role.name === 'string')
    ? profile.role.name.toLowerCase()
    : undefined;
  const hideAddTask = userRole === 'auditsenior' || userRole === 'auditjunior';

  // Check if user has permission to view task rankings
  const canViewRankings = permissions?.some(
    (permission: any) => permission.resource === "task-ranking" && permission.method === "get"
  );

  // Add null checks for project data
  const users = project?.users || [];
  const name = project?.name || '';


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

  // Function to refresh project data after task operations
  const handleRefresh = () => {
    // Only invalidate if we have a project ID
    if (project?.id) {
      // Invalidate project query to refresh the entire project data
      queryClient.invalidateQueries({ queryKey: ["project", project.id.toString()] });
      
      // Invalidate the project tasks hierarchy query to ensure task tables refresh
      queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy", project.id.toString()] });
    }
    
    // Also invalidate general tasks queries if they exist
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    
    console.log("Refreshing project data and task hierarchy...");
  };

  // Build tab items array
  const tabItems = [
    {
      label: 'Summary',
      key: '1',
      children: <ProjectSummary project={project} />
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
          <Tabs 
            type="card" 
            size="small"
            defaultActiveKey="todo"
            items={[
              {
                label: `To Do`,
                key: 'todo',
                children: (
                  <TaskTable 
                    projectId={project?.id?.toString?.() ?? String(project?.id ?? '')}
                    status="open"
                    showModal={showModal}
                    users={project?.users ?? []}
                    projectLead={project?.projectLead}
                    onRefresh={handleRefresh}
                    loading={loading}
                  />
                )
              },
              {
                label: `Doing`,
                key: 'doing',
                children: (
                  <TaskTable 
                    projectId={project?.id?.toString?.() ?? String(project?.id ?? '')}
                    status="in_progress"
                    showModal={showModal}
                    users={project?.users ?? []}
                    projectLead={project?.projectLead}
                    onRefresh={handleRefresh}
                    loading={loading}
                  />
                )
              },
              {
                label: `Completed`,
                key: 'completed',
                children: (
                  <TaskTable 
                    projectId={project?.id?.toString?.() ?? String(project?.id ?? '')}
                    status="done"
                    showModal={showModal}
                    users={project?.users ?? []}
                    projectLead={project?.projectLead}
                    onRefresh={handleRefresh}
                    loading={loading}
                  />
                )
              }
            ]}
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
      label: 'User Assignments',
      key: '4b',
      children: <ProjectUserAssignment 
        projectId={project?.id?.toString?.() ?? String(project?.id ?? '')}
        users={project?.users ?? []}
        onAssignmentChange={handleRefresh}
      />
    },
    {
      label: 'Timeline',
      key: '5',
      children: <ProjectTimeline projectId={project?.id} />
    },
    {
      label: 'Budget',
      key: '6',
      children: <ProjectBudget project={project} loading={loading} />
    }
  ];

  // Add Completion/Evaluation/Signoff tab for completed or signed off projects
  if (project?.status === 'completed' || project?.status === 'signed_off') {
    tabItems.push({
      label: 'Completion & Sign-off',
      key: 'completion',
      children: <ProjectCompletionWorkflow project={project} currentUser={profile} />
    });
  }

  // Add Rankings tab if user has permission
  if (canViewRankings) {
    tabItems.push({
      label: 'Rankings',
      key: '7',
      children: <ProjectRanking />
    });
  }

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
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectDetailComponent;