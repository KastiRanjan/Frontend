import React from "react";
import { Card, List, Badge, Typography, Tag, Space, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useUserDocuments, UserDocument, documentTypeLabels } from "@/hooks/user/useUserDocuments";

const { Title, Text } = Typography;

interface DocumentVerificationStatusProps {
  userId: string;
}

const DocumentVerificationStatus: React.FC<DocumentVerificationStatusProps> = ({ userId }) => {
  const navigate = useNavigate();
  
  const { 
    data: documents = [], 
    isLoading 
  } = useUserDocuments(userId);
  
  // Filter documents that are pending verification
  const pendingDocuments = documents.filter(doc => !doc.isVerified);
  
  // Calculate verification statistics
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(doc => doc.isVerified).length;
  
  const handleViewDocuments = () => {
    navigate(`/profile/${userId}/document-detail`);
  };
  
  return (
    <Card 
      title={
        <Space>
          <span>Document Verification</span>
          <Badge 
            count={pendingDocuments.length} 
            style={{ backgroundColor: pendingDocuments.length > 0 ? '#faad14' : '#52c41a' }}
          />
        </Space>
      }
      extra={
        <Button type="link" onClick={handleViewDocuments}>
          View All
        </Button>
      }
      loading={isLoading}
    >
      {totalDocuments > 0 ? (
        <>
          <div className="mb-4">
            <Text>
              Verification Status: {verifiedDocuments} of {totalDocuments} verified
              {' '}
              <Tag color={verifiedDocuments === totalDocuments ? "success" : "warning"}>
                {verifiedDocuments === totalDocuments ? "Complete" : "Incomplete"}
              </Tag>
            </Text>
          </div>
          
          {pendingDocuments.length > 0 && (
            <>
              <Title level={5}>Pending Documents:</Title>
              <List
                size="small"
                dataSource={pendingDocuments}
                renderItem={(doc: UserDocument) => (
                  <List.Item>
                    <Space>
                      <Badge status="warning" />
                      <span>{doc.filename}</span>
                      <Tag color="orange">{doc.documentType && documentTypeLabels[doc.documentType] || 'Other'}</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </>
          )}
        </>
      ) : (
        <Text>No documents uploaded yet</Text>
      )}
    </Card>
  );
};

export default DocumentVerificationStatus;