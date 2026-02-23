import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  message,
  Select,
  Tooltip,
  Row,
  Col,
  Statistic,
  Input
} from "antd";
import {
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  LockOutlined,
  SearchOutlined,
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
import { useSearchParams } from "react-router-dom";

const { Title, Text } = Typography;

const ClientReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: reports, isLoading: reportsLoading } = useMyClientReports();
  const { data: stats, isLoading: statsLoading } = useMyClientReportStats();
  const { mutate: download, isPending: downloading } = useDownloadClientReport();
  const { data: projects } = useClientProjects();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");

  // Read projectId from URL search params (e.g. ?projectId=xxx)
  useEffect(() => {
    const projectIdParam = searchParams.get("projectId");
    if (projectIdParam) {
      setSelectedProjectId(projectIdParam);
      // Clean up the URL param after applying
      searchParams.delete("projectId");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // Unique customers from reports for filtering
  const customerOptions = useMemo(() => {
    if (!reports) return [];
    const seen = new Set<string>();
    return reports
      .filter((r: ClientReportType) => {
        const custId = (r as any).customer?.id;
        if (!custId || seen.has(custId)) return false;
        seen.add(custId);
        return true;
      })
      .map((r: ClientReportType) => ({
        label: (r as any).customer?.name || "Unknown",
        value: (r as any).customer?.id
      }));
  }, [reports]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report: ClientReportType) => {
      if (selectedProjectId && report.projectId !== selectedProjectId) return false;
      if (selectedStatus && report.accessStatus !== selectedStatus) return false;
      if (selectedCustomerId && (report as any).customer?.id !== selectedCustomerId) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchTitle = report.title?.toLowerCase().includes(search);
        const matchDesc = report.description?.toLowerCase().includes(search);
        const matchProject = (report as any).project?.name?.toLowerCase().includes(search);
        if (!matchTitle && !matchDesc && !matchProject) return false;
      }
      return true;
    });
  }, [reports, selectedProjectId, selectedStatus, selectedCustomerId, searchText]);

  const handleClearFilters = () => {
    setSelectedProjectId(undefined);
    setSelectedStatus(undefined);
    setSelectedCustomerId(undefined);
    setSearchText("");
  };

  const hasFilters = selectedProjectId || selectedStatus || selectedCustomerId || searchText;

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
      render: (customer: any) => (
        customer?.name ? (
          <div className="flex items-center gap-1">
            <BankOutlined className="text-gray-400" />
            <span>{customer.name}</span>
          </div>
        ) : "-"
      )
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
      render: (project: any) => project?.name || <Text type="secondary">Standalone</Text>
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
      render: (fy: number) => fy ? `FY ${fy}` : "-"
    },
    {
      title: "Status",
      dataIndex: "accessStatus",
      key: "accessStatus",
      render: (status: ReportAccessStatus) => getStatusTag(status),
      filters: [
        { text: "Accessible", value: ReportAccessStatus.ACCESSIBLE },
        { text: "Pending", value: ReportAccessStatus.PENDING },
        { text: "Revoked", value: ReportAccessStatus.REVOKED }
      ],
      onFilter: (value: any, record: ClientReportType) => record.accessStatus === value
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: ClientReportType, b: ClientReportType) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
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
              size="small"
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

  if (reportsLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} className="!mb-6">Reports</Title>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Reports"
              value={stats?.total || 0}
              prefix={<FileOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ready to Download"
              value={stats?.accessible || 0}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Payment Pending"
              value={stats?.pending || 0}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: (stats?.pending || 0) > 0 ? "#faad14" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileOutlined />
            <span>All Reports</span>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search reports..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 180 }}
              allowClear
            />
            {customerOptions.length > 1 && (
              <Select
                placeholder="Filter by Company"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: 180 }}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={customerOptions}
              />
            )}
            <Select
              placeholder="Filter by Project"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: 180 }}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={[
                { label: "Standalone (No Project)", value: "__none__" },
                ...(projects?.map((p: ClientPortalProject) => ({
                  label: p.name,
                  value: p.id
                })) || [])
              ]}
            />
            {hasFilters && (
              <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </Space>
        }
      >
        {filteredReports && filteredReports.length > 0 ? (
          <Table
            dataSource={
              selectedProjectId === "__none__"
                ? filteredReports.filter((r: ClientReportType) => !r.projectId)
                : filteredReports
            }
            columns={reportColumns}
            rowKey="id"
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `${total} reports` }}
            scroll={{ x: 900 }}
          />
        ) : (
          <Empty description={
            hasFilters
              ? "No reports match the selected filters"
              : "No reports available yet"
          } />
        )}
      </Card>
    </div>
  );
};

export default ClientReports;
