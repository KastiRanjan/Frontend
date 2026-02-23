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
  BankOutlined,
  PaperClipOutlined
} from "@ant-design/icons";
import {
  useMyClientReports,
  useMyClientReportStats,
  useDownloadClientReport,
  useDownloadClientReportFile,
  useClientProjects
} from "@/hooks/clientReport/useClientPortal";
import { ClientReportType, ClientReportFileType, ReportAccessStatus } from "@/types/clientReport";
import { ClientPortalProject } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";

const { Text } = Typography;

const ClientReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: reports, isLoading: reportsLoading } = useMyClientReports();
  const { data: stats, isLoading: statsLoading } = useMyClientReportStats();
  const { mutate: download, isPending: downloading } = useDownloadClientReport();
  const { mutate: downloadFile, isPending: downloadingFile } = useDownloadClientReportFile();
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

    // If report has files, download the first file
    if (report.files && report.files.length > 0) {
      const file = report.files[0];
      downloadFile(
        { reportId: report.id, fileId: file.id, fileName: file.displayFileName || file.originalFileName },
        {
          onSuccess: () => message.success("Download started"),
          onError: () => message.error("Download failed. Please try again.")
        }
      );
    } else {
      // Legacy fallback
      download(
        { id: report.id, fileName: report.originalFileName || "download" },
        {
          onSuccess: () => message.success("Download started"),
          onError: () => message.error("Download failed. Please try again.")
        }
      );
    }
  };

  const handleDownloadFile = (report: ClientReportType, file: ClientReportFileType) => {
    if (report.accessStatus !== ReportAccessStatus.ACCESSIBLE) {
      message.warning("Report is not accessible for download.");
      return;
    }

    downloadFile(
      { reportId: report.id, fileId: file.id, fileName: file.displayFileName || file.originalFileName },
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
      width: 340,
      render: (title: string, record: ClientReportType) => {
        const files = record.files || [];
        const isProjectPaymentPending = record.projectId && projects?.find(
          (p: ClientPortalProject) => p.id === record.projectId && !p.isPaymentDone && !p.isPaymentTemporarilyEnabled
        );
        const isDisabled = record.accessStatus !== ReportAccessStatus.ACCESSIBLE || !!isProjectPaymentPending;
        const tooltipMsg = isProjectPaymentPending
          ? "Project payment pending – documents available after payment"
          : record.accessStatus === ReportAccessStatus.PENDING
          ? "Payment pending for this report"
          : record.accessStatus === ReportAccessStatus.REVOKED
          ? "Access to this report has been revoked"
          : "";

        return (
          <div style={{ minWidth: 0 }}>
            {/* Title */}
            <Tooltip title={title}>
              <div
                className="font-medium"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {title}
              </div>
            </Tooltip>

            {/* Description */}
            {record.description && (
              <Tooltip title={record.description}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Text type="secondary" className="text-xs">{record.description}</Text>
                </div>
              </Tooltip>
            )}

            {/* Files with inline download buttons */}
            {files.length > 0 ? (
              <div className="mt-1" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {files.map((file) => {
                  const fileName = file.displayFileName || file.originalFileName;
                  return (
                    <div key={file.id} style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                      <PaperClipOutlined style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }} />
                      <Tooltip title={fileName}>
                        <Text
                          type="secondary"
                          className="text-xs"
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                        >
                          {fileName}
                        </Text>
                      </Tooltip>
                      <Tooltip title={tooltipMsg || undefined}>
                        <Button
                          type="text"
                          size="small"
                          icon={isDisabled ? <LockOutlined /> : <DownloadOutlined />}
                          disabled={isDisabled}
                          loading={downloadingFile}
                          onClick={() => handleDownloadFile(record, file)}
                          style={{ flexShrink: 0, padding: "0 4px", height: 20, lineHeight: "20px" }}
                        />
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            ) : record.originalFileName ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, minWidth: 0 }}>
                <PaperClipOutlined style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }} />
                <Tooltip title={record.originalFileName}>
                  <Text
                    type="secondary"
                    className="text-xs"
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                  >
                    {record.originalFileName}
                  </Text>
                </Tooltip>
                <Tooltip title={tooltipMsg || undefined}>
                  <Button
                    type="text"
                    size="small"
                    icon={isDisabled ? <LockOutlined /> : <DownloadOutlined />}
                    disabled={isDisabled}
                    loading={downloading}
                    onClick={() => handleDownload(record)}
                    style={{ flexShrink: 0, padding: "0 4px", height: 20, lineHeight: "20px" }}
                  />
                </Tooltip>
              </div>
            ) : null}
          </div>
        );
      }
    },
    {
      title: "Company",
      dataIndex: "customer",
      key: "customer",
      width: 150,
      render: (customer: any) =>
        customer?.name ? (
          <Tooltip title={customer.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
              <BankOutlined style={{ color: "#9ca3af", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {customer.name}
              </span>
            </div>
          </Tooltip>
        ) : "-"
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
      width: 140,
      render: (documentType: any) =>
        documentType?.name ? (
          <Tooltip title={documentType.name}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {documentType.name}
            </span>
          </Tooltip>
        ) : "-"
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      width: 140,
      render: (project: any) =>
        project?.name ? (
          <Tooltip title={project.name}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
              {project.name}
            </span>
          </Tooltip>
        ) : (
          <Text type="secondary">Standalone</Text>
        )
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
      width: 90,
      render: (fy: number) => fy ? `FY ${fy}` : "-"
    },
    {
      title: "Status",
      dataIndex: "accessStatus",
      key: "accessStatus",
      width: 170,
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
      width: 130,
      sorter: (a: ClientReportType, b: ClientReportType) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend" as const,
      render: (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true })
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
            scroll={{ x: 1160 }}
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
