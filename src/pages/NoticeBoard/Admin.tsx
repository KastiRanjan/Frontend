import { useAllNoticeBoards } from "@/hooks/notice-board/useAllNoticeBoards";
import { useDeleteNoticeBoard } from "@/hooks/notice-board/useDeleteNoticeBoard";
import { useSession } from "@/context/SessionContext";
import { Table, Button, Space, message, Popconfirm, Badge, Typography, Card, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import NoticeBoardDetail from "@/components/NoticeBoard/NoticeBoardDetail";

const { Title, Text } = Typography;

const NoticeBoardAdmin = () => {
  const { data: notices, isLoading } = useAllNoticeBoards();
  const { mutateAsync: deleteNoticeBoard } = useDeleteNoticeBoard();
  const { profile } = useSession();
  const navigate = useNavigate();
  
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Determine if the user has permission to manage notices
  const roleName = (profile?.role as any)?.name || '';
  const permissions = profile?.role?.permission || [];
  
  // Permission check (similar to how you check in Attendance)
  const isAdmin = roleName === 'superuser' || 
                 roleName === 'admin' || 
                 roleName?.toLowerCase().includes('admin') ||
                 roleName?.toLowerCase().includes('super');
  
  const handleDelete = async (id: string) => {
    try {
      await deleteNoticeBoard({ id });
      message.success("Notice deleted successfully");
    } catch (error) {
      message.error("Failed to delete notice");
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedNotice(id);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedNotice(null);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space>
          <Link to={`/notice-board/edit/${record.id}`}>{text}</Link>
          {record.emailSent && (
            <Tooltip title="Email sent">
              <MailOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Distribution',
      key: 'distribution',
      render: (text: string, record: any) => (
        <Badge 
          status={record.sendToAll ? "success" : "warning"} 
          text={record.sendToAll ? "All Users" : "Selected Users/Roles"} 
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Read Statistics',
      key: 'readStats',
      render: (text: string, record: any) => {
        const totalTargets = record.sendToAll 
          ? 'All Users' 
          : `${record.users?.length || 0} Users`;
        
        const readCount = record.readByUsers?.length || 0;
        
        return (
          <Text>
            Read by {readCount} / {totalTargets}
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
            size="small"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/notice-board/edit/${record.id}`)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this notice?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card>
        <Text>You don't have permission to access this page.</Text>
      </Card>
    );
  }

  return (
    <Card
      title={<Title level={4}>Notice Board Management</Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/notice-board/create')}
        >
          Create Notice
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={notices || []}
        rowKey="id"
        loading={isLoading}
      />

      {selectedNotice && (
        <NoticeBoardDetail
          visible={detailVisible}
          noticeId={selectedNotice}
          onClose={handleCloseDetail}
        />
      )}
    </Card>
  );
};

export default NoticeBoardAdmin;