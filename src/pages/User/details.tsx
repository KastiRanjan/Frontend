import { useUserDetails } from "@/hooks/user/useUserDetails";
import { Card, List, Row, Col, Avatar, Tag, Badge, Descriptions, Divider, Space } from "antd";
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { Link, useParams } from "react-router-dom";
import UserActivityStatus from "@/components/UserActivityStatus";
import dayjs from "dayjs";

const UserDetails = () => {
    const { id } = useParams();
    const { data: user } = useUserDetails(id);
    // Get the last active time if available (for this demo we're just showing a placeholder)
    const lastActiveTime = user?.lastActiveAt ? new Date(user.lastActiveAt).getTime() : null;
    
    // Determine verification status
    const getVerificationStatus = (detail: any) => {
        if (!detail) return false;
        return detail.isVerified === true;
    };
    
    // Calculate overall profile completeness
    const calculateProfileCompleteness = () => {
        if (!user) return 0;
        
        // Define all possible sections
        const sections = [
            !!user.profile,
            !!user.bank_detail?.length,
            !!user.education_detail?.length,
            !!user.trainning_detail?.length,
            !!user.contract_detail?.length,
            !!user.document?.length
        ];
        
        // Count completed sections
        const completedSections = sections.filter(Boolean).length;
        
        // Calculate percentage
        return Math.round((completedSections / sections.length) * 100);
    };
    
    const completenessPercentage = calculateProfileCompleteness();
    
    return (
        <>
            <Card>
                <Row gutter={[24, 24]}>
                    {/* User header with avatar and basic info */}
                    <Col span={24}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                            <Avatar 
                                size={80} 
                                src={user?.avatar}
                                icon={!user?.avatar && <UserOutlined />}
                                style={{ marginRight: '24px' }}
                            />
                            
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Title level={3} style={{ marginBottom: '0', marginRight: '12px' }}>
                                        {user?.name}
                                    </Title>
                                    
                                    <UserActivityStatus 
                                        userId={id || ''}
                                        lastActiveTime={lastActiveTime}
                                        size="small"
                                        showAvatar={false}
                                    />
                                </div>
                                
                                <div style={{ marginTop: '4px' }}>
                                    <Tag color="blue">{user?.role?.name}</Tag>
                                    {user?.profile?.department?.name && (
                                        <Tag color="cyan">{user?.profile?.department?.name}</Tag>
                                    )}
                                    <Tag color={user?.status === 'active' ? 'green' : 'red'}>
                                        {user?.status}
                                    </Tag>
                                </div>
                                
                                <div style={{ marginTop: '8px', color: '#666' }}>
                                    {user?.email} • {user?.phoneNumber || 'No phone'}
                                </div>
                            </div>
                            
                            <div style={{ marginLeft: 'auto' }}>
                                <Link to={`/users/${id}/history`}>
                                    <Space>
                                        <HistoryOutlined />
                                        View History
                                    </Space>
                                </Link>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Profile completeness */}
                    <Col span={24}>
                        <Card 
                            size="small" 
                            title="Profile Completeness" 
                            style={{ marginBottom: '24px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '10px' }}>
                                        <div 
                                            style={{ 
                                                height: '100%', 
                                                width: `${completenessPercentage}%`, 
                                                background: completenessPercentage < 40 ? 'red' : 
                                                           completenessPercentage < 70 ? 'orange' : 'green',
                                                borderRadius: '10px',
                                                transition: 'width 0.5s ease-in-out'
                                            }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ marginLeft: '20px', fontWeight: 'bold', fontSize: '18px' }}>
                                    {completenessPercentage}%
                                </div>
                            </div>
                            
                            <Divider style={{ margin: '12px 0' }} />
                            
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.profile ? 'success' : 'default'} 
                                        text="Personal Details"
                                    />
                                </Col>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.bank_detail?.length ? 'success' : 'default'} 
                                        text="Bank Details" 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.education_detail?.length ? 'success' : 'default'}
                                        text="Education Details" 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.trainning_detail?.length ? 'success' : 'default'}
                                        text="Training Details" 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.contract_detail?.length ? 'success' : 'default'}
                                        text="Contract Details" 
                                    />
                                </Col>
                                <Col span={8}>
                                    <Badge 
                                        status={user?.document?.length ? 'success' : 'default'}
                                        text="Documents" 
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                
                <Divider orientation="left">Personal Information</Divider>
                
                <Descriptions bordered>
                    <Descriptions.Item label="Name">{user?.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{user?.phoneNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Role">{user?.role?.name}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={user?.status === 'active' ? 'green' : 'red'}>
                            {user?.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Active">
                        {user?.lastActiveAt ? dayjs(user.lastActiveAt).format('YYYY-MM-DD HH:mm:ss') : 'Never'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Joined">
                        {user?.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD') : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="2FA Enabled">
                        {user?.isTwoFAEnabled ? (
                            <CheckCircleOutlined style={{ color: 'green' }} />
                        ) : (
                            <CloseCircleOutlined style={{ color: 'red' }} />
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Title level={4}>Bank Details</Title>
                <List
                    dataSource={user?.bank_detail?.map((detail: any) => [
                        {
                            title: "Account Number",
                            description: detail.accountNo,
                        },
                        {
                            title: "Account Name",
                            description: detail.accountName,
                        },
                        {
                            title: "Bank Name",
                            description: detail.bankName,
                        },
                        {
                            title: "Bank Branch",
                            description: detail.bankBranch,
                        },
                    ]).flat()}

                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />

                <Title level={4}>Educational Details</Title>
                <List
                    dataSource={user?.education_detail?.map((detail: any) => [
                        {
                            title: "University/College",
                            description: detail.universityCollege,
                        },
                        {
                            title: "Faculty",
                            description: detail.faculty,
                        },
                        {
                            title: "Year of Passing",
                            description: detail.yearOfPassing,
                        },
                        {
                            title: "Place of Issue",
                            description: detail.placeOfIssue,
                        },
                    ]).flat()}
                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );
};

export default UserDetails;