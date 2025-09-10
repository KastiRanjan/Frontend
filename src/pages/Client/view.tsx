import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tabs, Spin, Divider, Typography, Space, Row, Col, Tag, Avatar } from 'antd';
import { EditOutlined, ArrowLeftOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, HomeOutlined, BankOutlined, IdcardOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useClientById } from '@/hooks/client/useClientById';
import PageTitle from '@/components/PageTitle';
import PortalCredentialsForm from '@/components/client/portalcredentialsform';
import moment from 'moment';
import { formatBusinessStatus } from '@/utils/formatUtils';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const ClientView: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClientById({ id: id || '' });
  const [activeTab, setActiveTab] = useState('basic');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleEdit = () => {
    navigate(`/client/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/client');
  };

  if (!client) {
    return <div>Client not found</div>;
  }

  const formatLegalStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'archive': return 'red';
      default: return 'default';
    }
  };

  return (
    <>
      <PageTitle
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              style={{ marginRight: 8 }}
            />
            Client Details
          </Space>
        }
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Edit
          </Button>
        }
      />

      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={64} 
                style={{ backgroundColor: '#1890ff', marginRight: 16 }}
              >
                {client.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Title level={3} style={{ margin: 0 }}>{client.name}</Title>
                {client.shortName && <Text type="secondary">{client.shortName}</Text>}
                <div style={{ marginTop: 8 }}>
                  <Tag color={getStatusColor(client.status)}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </Tag>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {client.registeredDate && (
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">Registered on:</Text>
                    <Text>{moment(client.registeredDate).format('MMM DD, YYYY')}</Text>
                  </Space>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <BankOutlined />
                  <Text type="secondary">Legal Status:</Text>
                  <Text>{formatLegalStatus(client.legalStatus)}</Text>
                </Space>
              </div>
              {(client.businessSize?.name || client.businessSizeEnum) && (
                <div>
                  <Space>
                    <TeamOutlined />
                    <Text type="secondary">Business Size:</Text>
                    <Text>{client.businessSize?.name || formatBusinessStatus(client.businessSizeEnum)}</Text>
                  </Space>
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Basic Information" key="basic">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={24} md={12}>
                <Card title="Business Information" bordered={false}>
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">PAN No:</Text>
                    <div>
                      <IdcardOutlined style={{ marginRight: 8 }} />
                      <Text strong>{client.panNo}</Text>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Industry Nature:</Text>
                    <div>
                      <Text strong>
                        {client.industryNature?.name || 
                         (client.industryNatureEnum && formatBusinessStatus(client.industryNatureEnum)) ||
                         '-'}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={24} md={12}>
                <Card title="Contact Information" bordered={false}>
                  {client.email && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">Email:</Text>
                      <div>
                        <MailOutlined style={{ marginRight: 8 }} />
                        <Text strong>{client.email}</Text>
                      </div>
                    </div>
                  )}
                  
                  {client.telephoneNo && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">Telephone:</Text>
                      <div>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <Text strong>{client.telephoneNo}</Text>
                      </div>
                    </div>
                  )}
                  
                  {client.mobileNo && (
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">Mobile:</Text>
                      <div>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <Text strong>{client.mobileNo}</Text>
                      </div>
                    </div>
                  )}
                  
                  {client.website && (
                    <div>
                      <Text type="secondary">Website:</Text>
                      <div>
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        <a href={client.website.startsWith('http') ? client.website : `http://${client.website}`} target="_blank" rel="noopener noreferrer">
                          {client.website}
                        </a>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginTop: 24 }}>
              <Card title="Address" bordered={false}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Country</Text>
                    <div>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      <Text strong>{client.country}</Text>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">State/Province</Text>
                    <div>
                      <Text strong>{client.state}</Text>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">District</Text>
                    <div>
                      <Text strong>{client.district}</Text>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Local Jurisdiction</Text>
                    <div>
                      <Text strong>{client.localJurisdiction}</Text>
                    </div>
                  </Col>
                  
                  {client.wardNo && (
                    <Col xs={24} sm={12} md={6}>
                      <Text type="secondary">Ward No</Text>
                      <div>
                        <Text strong>{client.wardNo}</Text>
                      </div>
                    </Col>
                  )}
                  
                  <Col xs={24} sm={12} md={6}>
                    <Text type="secondary">Locality</Text>
                    <div>
                      <Text strong>{client.locality}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </TabPane>

          <TabPane tab="Portal Credentials" key="credentials">
            <PortalCredentialsForm clientId={id!} readOnly={true} />
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default ClientView;
