import { useNoticeBoard } from "@/hooks/notice-board/useNoticeBoard";
import { Modal, Typography, Space, Divider, Image, Spin, List, Avatar, Tag, Descriptions } from "antd";
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNoticeBoardReadStatistics } from "@/hooks/notice-board/useNoticeBoardReadStatistics";
import { useSession } from "@/context/SessionContext";

const { Title, Text, Paragraph } = Typography;

interface NoticeBoardDetailProps {
  visible: boolean;
  noticeId: string;
  onClose: () => void;
}

const NoticeBoardDetail = ({ visible, noticeId, onClose }: NoticeBoardDetailProps) => {
  const { data: notice, isLoading } = useNoticeBoard(noticeId, visible);
  const { data: statistics, isLoading: statsLoading } = useNoticeBoardReadStatistics(noticeId, visible);
  const { profile } = useSession();

  // Determine if the current user has admin privileges (for statistics viewing)
  const roleName = (profile?.role as any)?.name || '';
  const isAdmin = roleName === 'superuser' || 
                 roleName === 'admin' || 
                 roleName?.toLowerCase().includes('admin') ||
                 roleName?.toLowerCase().includes('super');

  return (
    <Modal
      title="Notice Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>{notice?.title}</Title>
          <Divider style={{ margin: '8px 0' }} />
          
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {notice?.description}
          </Paragraph>
          
          {notice?.imagePath && (
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Image
                src={`${import.meta.env.VITE_BACKEND_URI}${notice.imagePath}`}
                alt="Notice attachment"
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </div>
          )}
          
          <Divider orientation="left">Notice Information</Divider>
          
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Created">
              {new Date(notice?.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {new Date(notice?.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Distribution">
              {notice?.sendToAll ? 'All Users' : 'Selected Users/Roles'}
            </Descriptions.Item>
            <Descriptions.Item label="Email Sent">
              {notice?.emailSent ? 'Yes' : 'No'}
            </Descriptions.Item>
          </Descriptions>
          
          {isAdmin && (
            <>
              <Divider orientation="left">Read Statistics</Divider>
              
              {statsLoading ? (
                <Spin size="small" />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>Read by {statistics?.totalReadUsers} of {statistics?.totalTargetUsers} users</Text>
                    <Tag color="blue">{statistics?.readPercentage}% Read</Tag>
                  </Space>
                  
                  <List
                    size="small"
                    header={<Text strong>Read by:</Text>}
                    dataSource={statistics?.readByUsers || []}
                    renderItem={(user: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={user.name}
                          description={user.email}
                        />
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      </List.Item>
                    )}
                  />
                  
                  {statistics?.totalReadUsers < statistics?.totalTargetUsers && (
                    <List
                      size="small"
                      header={<Text strong>Not Read by:</Text>}
                      dataSource={notice?.users?.filter((user: any) => 
                        !notice.readByUsers?.some((readUser: any) => readUser.id === user.id)
                      ) || []}
                      renderItem={(user: any) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={user.name}
                            description={user.email}
                          />
                          <ClockCircleOutlined style={{ color: '#faad14' }} />
                        </List.Item>
                      )}
                    />
                  )}
                </Space>
              )}
            </>
          )}
        </Space>
      )}
    </Modal>
  );
};

export default NoticeBoardDetail;