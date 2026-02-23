import React, { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  message,
  Select,
  Progress,
  Tooltip
} from "antd";
import {
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  ProjectOutlined,
  LockOutlined,
  BankOutlined
} from "@ant-design/icons";
import {
  useMyClientReports,
  useMyClientReportStats,
  useDownloadClientReport,
  useClientProjects
} from "@/hooks/clientReport/useClientPortal";
import { ClientReportType, ReportAccessStatus } from "@/types/clientReport";
import { ClientPortalProject } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";

const { Title, Text } = Typography;

const ClientDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { clientUser } = useClientAuth();
  const { data: reports, isLoading: reportsLoading } = useMyClientReports();
  const { data: stats, isLoading: statsLoading } = useMyClientReportStats();
  const { mutate: download, isPending: downloading } = useDownloadClientReport();
  const { data: projects, isLoading: projectsLoading } = useClientProjects();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report: ClientReportType) => {
      if (selectedProjectId && report.projectId !== selectedProjectId) return false;
      return true;
    });
  }, [reports, selectedProjectId]);

  const handleClearFilters = () => {
    setSelectedProjectId(undefined);
  };

  // Calculate payment summary from projects
  const paymentSummary = useMemo(() => {
    if (!projects) return { paid: 0, pending: 0, total: 0 };
    const paid = projects.filter((p: ClientPortalProject) => p.isPaymentDone || p.isPaymentTemporarilyEnabled).length;
    return { paid, pending: projects.length - paid, total: projects.length };
  }, [projects]);

  const handleDownload = (report: ClientReportType) => {
    if (report.accessStatus !== ReportAccessStatus.ACCESSIBLE) {
      message.warning(
        report.accessStatus === ReportAccessStatus.PENDING
          ? "Payment pending for this report. Please contact us."
          : "Access to this report has been revoked."
      );
      return;
    }

    download(
      { id: report.id, fileName: report.originalFileName },
      {
        onSuccess: () => message.success("Download started"),
        onError: () => message.error("Download failed. Please try again.")
      }
    );
  };

  const getStatusTag = (status: ReportAccessStatus) => {
    switch (status) {
      case ReportAccessStatus.ACCESSIBLE:
        return <Tag color="success" icon={<CheckCircleOutlined />}>Ready to Download</Tag>;
      case ReportAccessStatus.PENDING:
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Payment Pending</Tag>;
      case ReportAccessStatus.REVOKED:
        return <Tag color="error">Access Revoked</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const reportColumns = [
    {
      title: "Report",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: ClientReportType) => (
        <div>
          <div className="font-medium">{title}</div>
          {record.description && (
            <Text type="secondary" className="text-sm">{record.description}</Text>
          )}
        </div>
      )
    },
    {
      title: "Company",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => customer?.name || "-"
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
      render: (documentType: any) => documentType?.name || "-"
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (project: any) => project?.name || "-"
    },
    {
      title: "Status",
      dataIndex: "accessStatus",
      key: "accessStatus",
      render: (status: ReportAccessStatus) => getStatusTag(status)
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true })
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ClientReportType) => {
        const isProjectPaymentPending = record.projectId && projects?.find(
          (p: ClientPortalProject) => p.id === record.projectId && !p.isPaymentDone && !p.isPaymentTemporarilyEnabled
        );

        return (
          <Tooltip title={isProjectPaymentPending ? "Project payment pending - documents available after payment" : ""}>
            <Button
              type="primary"
              icon={isProjectPaymentPending ? <LockOutlined /> : <DownloadOutlined />}
              disabled={record.accessStatus !== ReportAccessStatus.ACCESSIBLE || !!isProjectPaymentPending}
              loading={downloading}
              onClick={() => handleDownload(record)}
            >
              {isProjectPaymentPending ? "Locked" : "Download"}
            </Button>
          </Tooltip>
        );
      }
    }
  ];

  if (reportsLoading || statsLoading || projectsLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Companies"
              value={clientUser?.customers?.length || 0}
              prefix={<BankOutlined className="text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Projects"
              value={projects?.length || 0}
              prefix={<ProjectOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Payment Done"
              value={paymentSummary.paid}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Reports"
              value={stats?.total || 0}
              prefix={<FileOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Project Progress */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <ProjectOutlined className="text-blue-600" />
                <span>Project Progress</span>
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigate("/client-portal/projects")}>
                View All
              </Button>
            }
          >
            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: ClientPortalProject) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Text className="font-medium text-sm">{project.name}</Text>
                        {project.customerName && (
                          <Tag className="text-xs">{project.customerName}</Tag>
                        )}
                        {project.isPaymentDone && (
                          <Tag color="success" className="text-xs">Paid</Tag>
                        )}
                        {!project.isPaymentDone && project.isPaymentTemporarilyEnabled && (
                          <Tag color="blue" className="text-xs">Temp Access</Tag>
                        )}
                        {!project.isPaymentDone && !project.isPaymentTemporarilyEnabled && (
                          <Tag color="warning" className="text-xs">Payment Pending</Tag>
                        )}
                      </div>
                      <Progress
                        percent={project.progress}
                        size="small"
                        status={project.status === "completed" ? "success" : "active"}
                      />
                    </div>
                  </div>
                ))}
                {projects.length > 5 && (
                  <Text type="secondary" className="text-sm">
                    + {projects.length - 5} more projects
                  </Text>
                )}
              </div>
            ) : (
              <Empty description="No projects found" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileOutlined />
            <span>Recent Reports</span>
          </div>
        }
        extra={
          <Space wrap>
            <Select
              placeholder="Filter by Project"
              allowClear
              style={{ width: 200 }}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={projects?.map((p: ClientPortalProject) => ({
                label: p.name,
                value: p.id
              })) || []}
            />
            {selectedProjectId && (
              <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
                Clear
              </Button>
            )}
            <Button type="link" onClick={() => navigate("/client-portal/reports")}>
              View All Reports
            </Button>
          </Space>
        }
      >
        {filteredReports && filteredReports.length > 0 ? (
          <Table
            dataSource={filteredReports.slice(0, 5)}
            columns={reportColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty description={
            selectedProjectId
              ? "No reports match the selected filter"
              : "No reports available yet"
          } />
        )}
      </Card>

      {/* Info */}
      <Card className="mt-6">
        <Title level={5}>Need Help?</Title>
        <Text type="secondary">
          If you have questions about your reports or need to make a payment,
          please contact our team. Reports will be available for download
          once payment is confirmed.
        </Text>
      </Card>
    </div>
  );
};

export default ClientDashboardHome;
