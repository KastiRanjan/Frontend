import React, { useState } from "react";
import { Card, Table, Button, Upload, Space, Typography, Tag, message, Popconfirm, Modal, Form, Select, Input, DatePicker } from "antd";
import { UploadOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { 
  useUserDocuments, 
  useDeleteUserDocument, 
  useUploadUserDocument, 
  useVerifyUserDocument, 
  UserDocument,
  DocumentType,
  documentTypeLabels 
} from "@/hooks/user/useUserDocuments";
import dayjs from "dayjs";

const { Title } = Typography;

const PersonalDocumentsDetails = () => {
  const { id } = useParams();
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { 
    data: documents = [] as UserDocument[], 
    isLoading: loading,
    error
  } = useUserDocuments(id);

  const deleteDocument = useDeleteUserDocument();
  const uploadDocument = useUploadUserDocument();
  const verifyDocument = useVerifyUserDocument();
  
  // Show error message if documents failed to load
  React.useEffect(() => {
    if (error) {
      message.error("Failed to load documents");
    }
  }, [error]);
  
  const showUploadModal = () => {
    setIsUploadModalVisible(true);
  };
  
  const handleUploadCancel = () => {
    setIsUploadModalVisible(false);
    form.resetFields();
  };

  const handleUploadSubmit = async () => {
    if (!id) return;
    
    try {
      const values = await form.validateFields();
      const { file, documentType, identificationNo, dateOfIssue, placeOfIssue } = values;
      
      // Get the first file from the upload component
      const uploadFile = file?.fileList[0]?.originFileObj;
      
      if (!uploadFile) {
        message.error("Please select a file to upload");
        return;
      }
      
      await uploadDocument.mutateAsync({
        userId: id,
        file: uploadFile,
        documentType,
        identificationNo,
        dateOfIssue: dateOfIssue ? dateOfIssue.format('YYYY-MM-DD') : undefined,
        placeOfIssue
      });
      
      message.success("Document uploaded successfully");
      setIsUploadModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to upload document");
    }
  };

  const customRequest = async (options: any) => {
    options.onSuccess(); // Let the form handle the actual upload
  };

  const handleDelete = async (documentId: string) => {
    if (!id) return;
    
    try {
      await deleteDocument.mutateAsync({ userId: id, documentId });
      message.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      message.error("Failed to delete document");
    }
  };
  
  const handleVerify = async (documentId: string) => {
    if (!id) return;
    
    try {
      await verifyDocument.mutateAsync({
        userId: id,
        documentId,
        isVerified: true
      });
      message.success("Document verified successfully");
    } catch (error) {
      console.error("Verification failed:", error);
      message.error("Failed to verify document");
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
      render: (text: DocumentType) => documentTypeLabels[text] || "Other",
    },
    {
      title: "Identification No",
      dataIndex: "identificationNo",
      key: "identificationNo",
      render: (text: string) => text || "-",
    },
    {
      title: "Upload Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: UserDocument) => (
        <Tag color={record.isVerified ? "green" : "orange"}>
          {record.isVerified ? "Verified" : "Pending Verification"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: UserDocument) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URI}${record.documentFile}`, '_blank')}
          >
            View
          </Button>
          
          {!record.isVerified && (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="primary"
              onClick={() => handleVerify(record.id)}
            >
              Verify
            </Button>
          )}
          
          <Popconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Document Verification Status Dashboard */}      
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Personal Documents</Title>
          <Button 
            icon={<UploadOutlined />} 
            type="primary"
            onClick={showUploadModal}
          >
            Upload Document
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={documents} 
          rowKey="id" 
          loading={loading}
          pagination={false} 
          locale={{ emptyText: "No documents found" }}
        />
      </Card>
      
      {/* Document Upload Modal */}
      <Modal
        title="Upload Document"
        open={isUploadModalVisible}
        onCancel={handleUploadCancel}
        onOk={handleUploadSubmit}
        okText="Upload"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="file"
            label="Document File"
            rules={[{ required: true, message: 'Please select a file to upload' }]}
          >
            <Upload
              customRequest={customRequest}
              maxCount={1}
              beforeUpload={(file) => {
                const isValidFormat = [
                  'image/jpeg', 
                  'image/png', 
                  'image/gif', 
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ].includes(file.type);
                if (!isValidFormat) {
                  message.error('You can only upload JPG/PNG/GIF/PDF/DOC/DOCX file!');
                }
                const isLessThan10M = file.size / 1024 / 1024 < 10;
                if (!isLessThan10M) {
                  message.error('File must be smaller than 10MB!');
                }
                return isValidFormat && isLessThan10M;
              }}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="documentType"
            label="Document Type"
            rules={[{ required: true, message: 'Please select a document type' }]}
          >
            <Select placeholder="Select document type">
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="identificationNo"
            label="Identification Number"
          >
            <Input placeholder="Enter identification number" />
          </Form.Item>
          
          <Form.Item
            name="dateOfIssue"
            label="Date of Issue"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="placeOfIssue"
            label="Place of Issue"
          >
            <Input placeholder="Enter place of issue" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonalDocumentsDetails;