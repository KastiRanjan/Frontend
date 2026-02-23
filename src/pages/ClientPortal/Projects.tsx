import React from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Spin,
  Empty,
  Progress,
  Badge,
  Statistic,
  Tooltip
} from "antd";
import {
  ProjectOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  DollarOutlined,
  LockOutlined,
  UnlockOutlined,
  BankOutlined
} from "@ant-design/icons";
import { useClientProjects } from "@/hooks/clientReport/useClientPortal";
import { ClientPortalProject } from "@/types/project";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { color: "processing", text: "Active", icon: <ClockCircleOutlined /> };
    case "completed":
      return { color: "success", text: "Completed", icon: <CheckCircleOutlined /> };
    case "signed_off":
      return { color: "cyan", text: "Signed Off", icon: <CheckCircleOutlined /> };
    case "suspended":
      return { color: "warning", text: "Suspended", icon: <ClockCircleOutlined /> };
    case "archived":
      return { color: "default", text: "Archived", icon: <FileOutlined /> };
    default:
      return { color: "default", text: status, icon: null };
  }
};

const ClientProjects: React.FC = () => {
  const { data: projects, isLoading } = useClientProjects();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  const activeProjects = projects?.filter((p: ClientPortalProject) => p.status === "active") || [];
  const completedProjects = projects?.filter((p: ClientPortalProject) => p.status === "completed" || p.status === "signed_off") || [];
  const otherProjects = projects?.filter((p: ClientPortalProject) => !["active", "completed", "signed_off"].includes(p.status)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">Projects</Title>
        <div className="flex gap-3">
          <Badge count={activeProjects.length} showZero>
            <Tag color="processing" className="px-3 py-1">Active</Tag>
          </Badge>
          <Badge count={completedProjects.length} showZero>
            <Tag color="success" className="px-3 py-1">Completed</Tag>
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Projects"
              value={projects?.length || 0}
              prefix={<ProjectOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Payment Completed"
              value={projects?.filter((p: ClientPortalProject) => p.isPaymentDone).length || 0}
              prefix={<DollarOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Payment Pending"
              value={projects?.filter((p: ClientPortalProject) => !p.isPaymentDone && !p.isPaymentTemporarilyEnabled).length || 0}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
      </Row>

      {projects && projects.length > 0 ? (
        <div className="space-y-6">
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div>
              <Title level={5} className="!mb-3 text-blue-600">
                <ClockCircleOutlined className="mr-2" />
                Active Projects
              </Title>
              <Row gutter={[16, 16]}>
                {activeProjects.map((project: ClientPortalProject) => (
                  <Col xs={24} md={12} xl={8} key={project.id}>
                    <ProjectCard project={project} />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <Title level={5} className="!mb-3 text-green-600">
                <CheckCircleOutlined className="mr-2" />
                Completed Projects
              </Title>
              <Row gutter={[16, 16]}>
                {completedProjects.map((project: ClientPortalProject) => (
                  <Col xs={24} md={12} xl={8} key={project.id}>
                    <ProjectCard project={project} />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Other Projects */}
          {otherProjects.length > 0 && (
            <div>
              <Title level={5} className="!mb-3 text-gray-600">
                Other Projects
              </Title>
              <Row gutter={[16, 16]}>
                {otherProjects.map((project: ClientPortalProject) => (
                  <Col xs={24} md={12} xl={8} key={project.id}>
                    <ProjectCard project={project} />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <Empty description="No projects associated with your account" />
        </Card>
      )}
    </div>
  );
};

// Project Card Sub-component
const ProjectCard: React.FC<{ project: ClientPortalProject }> = ({ project }) => {
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(project.status);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      hoverable
      className="h-full cursor-pointer"
      onClick={() => navigate(`/client-portal/reports?projectId=${project.id}`)}
      styles={{
        body: { padding: "20px" }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Text className="font-semibold text-base block">{project.name}</Text>
          {project.customerName && (
            <div className="flex items-center gap-1 mt-1">
              <BankOutlined className="text-gray-400 text-xs" />
              <Text type="secondary" className="text-xs">{project.customerName}</Text>
            </div>
          )}
          {project.natureOfWork && (
            <Text type="secondary" className="text-xs block mt-0.5">{project.natureOfWork}</Text>
          )}
        </div>
        <Tag color={statusConfig.color as any}>{statusConfig.text}</Tag>
      </div>

      {/* Description */}
      {project.description && (
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          className="text-sm !mb-3"
        >
          {project.description}
        </Paragraph>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <Text type="secondary" className="text-xs">Progress</Text>
          <Text className="text-xs font-medium">
            {project.completedTasks}/{project.totalTasks} tasks
          </Text>
        </div>
        <Progress
          percent={project.progress}
          size="small"
          status={project.status === "completed" ? "success" : "active"}
          strokeColor={project.progress === 100 ? "#52c41a" : undefined}
        />
      </div>

      {/* Payment Status */}
      <div className="mb-3">
        {project.isPaymentDone ? (
          <Tag color="success" icon={<UnlockOutlined />} className="w-full text-center">
            Payment Completed - Documents Available
          </Tag>
        ) : project.isPaymentTemporarilyEnabled ? (
          <Tooltip title="Temporary access has been granted by admin">
            <Tag color="blue" icon={<UnlockOutlined />} className="w-full text-center">
              Temporary Access Granted
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="warning" icon={<LockOutlined />} className="w-full text-center">
            Payment Pending - Documents Locked
          </Tag>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <CalendarOutlined />
          <span>{formatDate(project.startingDate)} - {formatDate(project.endingDate)}</span>
        </div>
        <Tag className="text-xs">FY {project.fiscalYear}</Tag>
      </div>
    </Card>
  );
};

export default ClientProjects;
