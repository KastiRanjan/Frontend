import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Switch,
  List
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  EditOutlined,
  PaperClipOutlined,
  SaveOutlined
} from "@ant-design/icons";
import {
  useClientReports,
  useCreateClientReport,
  useCreateMultipleClientReports,
  useUpdateClientReport,
  useUpdateReportAccess,
  useDeleteClientReport,
  useBulkUpdateReportAccess,
  useProjectsByCustomer,
  useAddFilesToReport,
  useRemoveFileFromReport,
  useUpdateReportFileDisplayName
} from "@/hooks/clientReport";
import { useDocumentTypesForCustomer, useDocumentTypes } from "@/hooks/clientReport/useClientReportDocumentTypes";
import { useClient } from "@/hooks/client/useClient";
import {
  ClientReportType,
  ClientReportFileType,
  ReportAccessStatus,
  UpdateReportAccessPayload
} from "@/types/clientReport";
import { formatDistanceToNow, format } from "date-fns";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ClientReportsAdmin: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<ReportAccessStatus | undefined>();
  const [filterCustomerId, setFilterCustomerId] = useState<string | undefined>();
  const [filterDocumentTypeId, setFilterDocumentTypeId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ClientReportType | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedCustomerForForm, setSelectedCustomerForForm] = useState<string | undefined>();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [accessForm] = Form.useForm();

  const { data: reports, isLoading } = useClientReports({
    accessStatus: filterStatus,
    customerId: filterCustomerId,
    documentTypeId: filterDocumentTypeId
  });
  const { data: clients } = useClient();
  const { data: projects } = useProjectsByCustomer(selectedCustomerForForm);
  const { data: documentTypesForCustomer } = useDocumentTypesForCustomer(selectedCustomerForForm);
  const { data: allDocumentTypes } = useDocumentTypes({ isActive: true });
  const { mutate: createReport, isPending: creating } = useCreateClientReport();
  const { mutate: createMultipleReports, isPending: creatingMultiple } = useCreateMultipleClientReports();
  const { mutate: updateReport, isPending: updating } = useUpdateClientReport();
  const { mutate: updateAccess, isPending: updatingAccess } = useUpdateReportAccess();
  const { mutate: deleteReport } = useDeleteClientReport();
  const { mutate: bulkUpdateAccess } = useBulkUpdateReportAccess();
  const { mutate: addFiles, isPending: addingFiles } = useAddFilesToReport();
  const { mutate: removeFile } = useRemoveFileFromReport();
  const { mutate: updateFileDisplayName } = useUpdateReportFileDisplayName();

  // State for inline editing file display names
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState("");

  const handleOpenEditModal = (report: ClientReportType) => {
    setSelectedReport(report);
    setSelectedCustomerForForm(report.customerId);
    editForm.setFieldsValue({
      title: report.title,
      description: report.description,
      projectId: report.projectId,
      documentTypeId: report.documentTypeId,
      fiscalYear: report.fiscalYear,
      isVisible: report.isVisible
    });
    setIsEditModalOpen(true);
  };

  const handleEditReport = (values: any) => {
    if (!selectedReport) return;

    updateReport(
      { id: selectedReport.id, payload: values },
      {
        onSuccess: () => {
          message.success("Report updated successfully");
          setIsEditModalOpen(false);
          setSelectedReport(null);
          editForm.resetFields();
          setSelectedCustomerForForm(undefined);
        },
        onError: (err: any) => {
          message.error(err.response?.data?.message || "Failed to update report");
        }
      }
    );
  };

  const handleCreateReport = (values: any) => {
    const fileList = values.file?.fileList;
    if (!fileList || fileList.length === 0) {
      message.error("Please select at least one file");
      return;
    }

    const files = fileList.map((f: any) => f.originFileObj).filter(Boolean);
    if (files.length === 0) {
      message.error("Please select at least one file");
      return;
    }

    const { file: _, ...rest } = values;

    if (files.length === 1) {
      createReport(
        { ...rest, file: files[0] },
        {
          onSuccess: () => {
            message.success("Report uploaded successfully");
            setIsModalOpen(false);
            form.resetFields();
            setSelectedCustomerForForm(undefined);
          },
          onError: (err: any) => {
            message.error(err.response?.data?.message || "Failed to upload report");
          }
        }
      );
    } else {
      createMultipleReports(
        { ...rest, files },
        {
          onSuccess: () => {
            message.success(`${files.length} reports uploaded successfully`);
            setIsModalOpen(false);
            form.resetFields();
            setSelectedCustomerForForm(undefined);
          },
          onError: (err: any) => {
            message.error(err.response?.data?.message || "Failed to upload reports");
          }
        }
      );
    }
  };

  const handleUpdateAccess = (values: UpdateReportAccessPayload) => {
    if (!selectedReport) return;

    updateAccess(
      { id: selectedReport.id, payload: values },
      {
        onSuccess: () => {
          message.success("Access updated successfully");
          setIsAccessModalOpen(false);
          setSelectedReport(null);
          accessForm.resetFields();
        },
        onError: () => {
          message.error("Failed to update access");
        }
      }
    );
  };

  const handleBulkAccess = (accessStatus: ReportAccessStatus) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select reports first");
      return;
    }

    bulkUpdateAccess(
      { ids: selectedRowKeys, accessStatus },
      {
        onSuccess: () => {
          message.success(`Access updated for ${selectedRowKeys.length} reports`);
          setSelectedRowKeys([]);
        },
        onError: () => {
          message.error("Failed to update access");
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteReport(id, {
      onSuccess: () => {
        message.success("Report deleted successfully");
      },
      onError: () => {
        message.error("Failed to delete report");
      }
    });
  };

  const getStatusTag = (status: ReportAccessStatus) => {
    switch (status) {
      case ReportAccessStatus.ACCESSIBLE:
        return <Tag color="success" icon={<CheckCircleOutlined />}>Accessible</Tag>;
      case ReportAccessStatus.PENDING:
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending</Tag>;
      case ReportAccessStatus.REVOKED:
        return <Tag color="error" icon={<StopOutlined />}>Revoked</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: ClientReportType) => {
        const files = record.files || [];
        const fileCount = files.length;
        return (
          <div>
            <div className="font-medium">{title}</div>
            {fileCount > 0 ? (
              <Tooltip title={files.map(f => f.displayFileName || f.originalFileName).join(", ")}>
                <Text type="secondary" className="text-xs">
                  <PaperClipOutlined /> {fileCount} file{fileCount > 1 ? "s" : ""}
                </Text>
              </Tooltip>
            ) : (
              <Text type="secondary" className="text-xs">
                {record.displayFileName || record.originalFileName || "No files"}
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: "Client",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => customer?.name || "-"
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (project: any) => project?.name || "-"
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
      render: (documentType: any) => documentType?.name ? (
        <Tag icon={<FileTextOutlined />}>{documentType.name}</Tag>
      ) : "-"
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
      render: (year: number) => year || "-"
    },
    {
      title: "Access Status",
      dataIndex: "accessStatus",
      key: "accessStatus",
      render: (status: ReportAccessStatus) => getStatusTag(status)
    },
    {
      title: "Visible",
      dataIndex: "isVisible",
      key: "isVisible",
      render: (visible: boolean, record: ClientReportType) => (
        <Switch
          checked={visible}
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
          onChange={(checked) => {
            updateReport(
              { id: record.id, payload: { isVisible: checked } },
              {
                onSuccess: () => {
                  message.success(
                    `Report ${checked ? "shown" : "hidden"} successfully`
                  );
                },
                onError: () => {
                  message.error("Failed to update visibility");
                }
              }
            );
          }}
        />
      )
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Tooltip title={format(new Date(date), "PPpp")}>
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </Tooltip>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ClientReportType) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Button
            size="small"
            onClick={() => {
              setSelectedReport(record);
              accessForm.setFieldsValue({
                accessStatus: record.accessStatus,
                accessNotes: record.accessNotes
              });
              setIsAccessModalOpen(true);
            }}
          >
            Access
          </Button>
          <Popconfirm
            title="Delete this report?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Calculate stats
  const stats = {
    total: reports?.length || 0,
    accessible: reports?.filter((r) => r.accessStatus === ReportAccessStatus.ACCESSIBLE).length || 0,
    pending: reports?.filter((r) => r.accessStatus === ReportAccessStatus.PENDING).length || 0,
    revoked: reports?.filter((r) => r.accessStatus === ReportAccessStatus.REVOKED).length || 0
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">
          Client Reports Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Upload Report
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Reports" value={stats.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Accessible"
              value={stats.accessible}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Revoked"
              value={stats.revoked}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Bulk Actions */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <Space wrap>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Client"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={setFilterCustomerId}
            >
              {clients?.map((client: any) => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 180 }}
              placeholder="Filter by Document Type"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={setFilterDocumentTypeId}
            >
              {allDocumentTypes?.map((type: any) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Filter by Status"
              allowClear
              onChange={setFilterStatus}
            >
              <Option value={ReportAccessStatus.PENDING}>Pending</Option>
              <Option value={ReportAccessStatus.ACCESSIBLE}>Accessible</Option>
              <Option value={ReportAccessStatus.REVOKED}>Revoked</Option>
            </Select>
          </Space>
          {selectedRowKeys.length > 0 && (
            <Space>
              <Text type="secondary">{selectedRowKeys.length} selected</Text>
              <Button
                type="primary"
                onClick={() => handleBulkAccess(ReportAccessStatus.ACCESSIBLE)}
              >
                Grant Access
              </Button>
              <Button onClick={() => handleBulkAccess(ReportAccessStatus.REVOKED)}>
                Revoke Access
              </Button>
            </Space>
          )}
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[])
          }}
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Client Report"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReport}
        >
          <Form.Item
            name="title"
            label="Report Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter report title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="Client"
            rules={[{ required: true, message: "Please select client" }]}
          >
            <Select 
              placeholder="Select client"
              onChange={(value) => {
                setSelectedCustomerForForm(value);
                form.setFieldValue("projectId", undefined);
                form.setFieldValue("documentTypeId", undefined);
              }}
            >
              {clients?.map((client: any) => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="projectId"
            label="Project"
          >
            <Select 
              placeholder={selectedCustomerForForm ? "Select project (optional)" : "Select client first"} 
              disabled={!selectedCustomerForForm}
              allowClear
            >
              {projects?.map((project: any) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="documentTypeId" label="Document Type">
            <Select 
              placeholder={selectedCustomerForForm ? "Select document type (optional)" : "Select client first"} 
              allowClear
              disabled={!selectedCustomerForForm}
            >
              {documentTypesForCustomer?.map((type: any) => (
                <Option key={type.id} value={type.id}>
                  {type.name} {type.isGlobal && "(Global)"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="fiscalYear" label="Fiscal Year">
            <Input type="number" placeholder="e.g., 2080" />
          </Form.Item>

          <Form.Item
            name="file"
            label="File(s)"
            rules={[{ required: true, message: "Please select at least one file" }]}
          >
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Select File(s)</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="isVisible" label="Visibility" initialValue={false}>
            <Select>
              <Option value={true}>Visible to Client</Option>
              <Option value={false}>Hidden from Client</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creating || creatingMultiple}>
              Upload
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Access Update Modal */}
      <Modal
        title="Update Report Access"
        open={isAccessModalOpen}
        onCancel={() => {
          setIsAccessModalOpen(false);
          setSelectedReport(null);
          accessForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={accessForm}
          layout="vertical"
          onFinish={handleUpdateAccess}
        >
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <Text strong>{selectedReport?.title}</Text>
            <br />
            <Text type="secondary">{selectedReport?.customer?.name}</Text>
          </div>

          <Form.Item
            name="accessStatus"
            label="Access Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={ReportAccessStatus.PENDING}>
                <Space>
                  <ClockCircleOutlined style={{ color: "#faad14" }} />
                  Pending Payment
                </Space>
              </Option>
              <Option value={ReportAccessStatus.ACCESSIBLE}>
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  Accessible (Payment Done)
                </Space>
              </Option>
              <Option value={ReportAccessStatus.REVOKED}>
                <Space>
                  <StopOutlined style={{ color: "#ff4d4f" }} />
                  Access Revoked
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="accessNotes" label="Notes">
            <TextArea rows={3} placeholder="Add notes (optional)" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAccessModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updatingAccess}>
              Update Access
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Report Modal */}
      <Modal
        title="Edit Report"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedReport(null);
          editForm.resetFields();
          setSelectedCustomerForForm(undefined);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditReport}
        >
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <Text type="secondary">Client: </Text>
            <Text strong>{selectedReport?.customer?.name}</Text>
          </div>

          <Form.Item
            name="title"
            label="Report Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter report title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          {/* Files Management Section */}
          {selectedReport && (selectedReport.files?.length || 0) > 0 && (
            <div className="mb-4">
              <Text strong className="block mb-2">Attached Files</Text>
              <List
                size="small"
                bordered
                dataSource={selectedReport.files || []}
                renderItem={(file: ClientReportFileType) => (
                  <List.Item
                    actions={[
                      editingFileId === file.id ? (
                        <Button
                          key="save"
                          size="small"
                          type="link"
                          icon={<SaveOutlined />}
                          onClick={() => {
                            updateFileDisplayName(
                              { reportId: selectedReport.id, fileId: file.id, displayFileName: editingFileName },
                              {
                                onSuccess: () => {
                                  message.success("File name updated");
                                  setEditingFileId(null);
                                  setEditingFileName("");
                                }
                              }
                            );
                          }}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          key="edit"
                          size="small"
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingFileId(file.id);
                            setEditingFileName(file.displayFileName || file.originalFileName);
                          }}
                        >
                          Rename
                        </Button>
                      ),
                      <Popconfirm
                        key="delete"
                        title="Remove this file?"
                        onConfirm={() => {
                          removeFile(
                            { reportId: selectedReport.id, fileId: file.id },
                            {
                              onSuccess: () => {
                                message.success("File removed");
                                // Update selectedReport locally
                                setSelectedReport({
                                  ...selectedReport,
                                  files: selectedReport.files?.filter(f => f.id !== file.id)
                                });
                              },
                              onError: () => message.error("Failed to remove file")
                            }
                          );
                        }}
                      >
                        <Button size="small" type="link" danger icon={<DeleteOutlined />}>
                          Remove
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <div className="flex-1">
                      {editingFileId === file.id ? (
                        <Input
                          size="small"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                          onPressEnter={() => {
                            updateFileDisplayName(
                              { reportId: selectedReport.id, fileId: file.id, displayFileName: editingFileName },
                              {
                                onSuccess: () => {
                                  message.success("File name updated");
                                  setEditingFileId(null);
                                  setEditingFileName("");
                                }
                              }
                            );
                          }}
                        />
                      ) : (
                        <Text>
                          <PaperClipOutlined className="mr-1" />
                          {file.displayFileName || file.originalFileName}
                        </Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Add More Files */}
          {selectedReport && (
            <div className="mb-4">
              <Upload
                beforeUpload={() => false}
                multiple
                onChange={(info) => {
                  const newFiles = info.fileList
                    .filter((f: any) => f.originFileObj)
                    .map((f: any) => f.originFileObj);
                  if (newFiles.length > 0 && info.file.status !== "removed") {
                    // Only trigger on the last file added
                    const lastFile = info.fileList[info.fileList.length - 1];
                    if (lastFile.uid === info.file.uid) {
                      addFiles(
                        { id: selectedReport.id, files: newFiles },
                        {
                          onSuccess: (updatedReport) => {
                            message.success("Files added successfully");
                            setSelectedReport(updatedReport);
                            info.fileList.length = 0; // Clear the upload list
                          },
                          onError: () => message.error("Failed to add files")
                        }
                      );
                    }
                  }
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={addingFiles} size="small">
                  Add More Files
                </Button>
              </Upload>
            </div>
          )}

          <Form.Item
            name="projectId"
            label="Project"
          >
            <Select 
              placeholder="Select project (optional)" 
              allowClear
            >
              {projects?.map((project: any) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="documentTypeId" label="Document Type">
            <Select 
              placeholder="Select document type (optional)" 
              allowClear
            >
              {documentTypesForCustomer?.map((type: any) => (
                <Option key={type.id} value={type.id}>
                  {type.name} {type.isGlobal && "(Global)"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="fiscalYear" label="Fiscal Year">
            <Input type="number" placeholder="e.g., 2080" />
          </Form.Item>

          <Form.Item name="isVisible" label="Visibility">
            <Select>
              <Option value={true}>Visible to Client</Option>
              <Option value={false}>Hidden from Client</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => {
              setIsEditModalOpen(false);
              setSelectedReport(null);
              editForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Update Report
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientReportsAdmin;
