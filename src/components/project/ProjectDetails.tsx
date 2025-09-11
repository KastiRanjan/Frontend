import { ProjectType } from '@/types/project';
import { Card, Descriptions, Tag } from 'antd';
import moment from 'moment';

interface ProjectDetailsProps {
  project: ProjectType;
}

const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  return (
    <Card>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Project Name" span={2}>
          {project.name}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag 
            color={
              project.status === 'active' 
                ? 'green' 
                : project.status === 'suspended' 
                ? 'orange' 
                : project.status === 'archived'
                ? 'red'
                : 'blue'
            }
          >
            {project.status.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Nature of Work">
          {typeof project.natureOfWork === 'string' 
            ? project.natureOfWork.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            : (project.natureOfWork as any)?.name || 'N/A'
          }
        </Descriptions.Item>
        <Descriptions.Item label="Fiscal Year">
          {project.fiscalYear}/{(project.fiscalYear + 1).toString().slice(-2)}
        </Descriptions.Item>
        <Descriptions.Item label="Starting Date">
          {moment(project.startingDate).format('MMM D, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Ending Date">
          {moment(project.endingDate).format('MMM D, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Project Lead">
          {project.projectLead?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Project Manager">
          {project.projectManager?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Client" span={2}>
          {(project as any).customer?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Billing Entity" span={2}>
          {(project as any).billing?.name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {project.description}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {moment(project.createdAt).format('MMM D, YYYY h:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {moment(project.updatedAt).format('MMM D, YYYY h:mm A')}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProjectDetails;
