import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Descriptions,
  Tag,
  Statistic,
  Divider
} from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ProjectOutlined,
  IdcardOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useClientCompanyDetails } from "@/hooks/clientReport/useClientPortal";
import { ClientCompanyDetails } from "@/types/project";

const { Title, Text } = Typography;

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "success";
    case "suspended": return "warning";
    case "archive": return "default";
    default: return "default";
  }
};

const formatEnumLabel = (value: string | null) => {
  if (!value) return "-";
  return value.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

const ClientCompany: React.FC = () => {
  const { data: companies, isLoading } = useClientCompanyDetails();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!companies || (Array.isArray(companies) && companies.length === 0)) {
    return (
      <Card>
        <Empty description="No companies associated with your account." />
      </Card>
    );
  }

  const companyList: ClientCompanyDetails[] = Array.isArray(companies) ? companies : [companies];

  return (

      <div className="space-y-8">
        {companyList.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
  );
};

const CompanyCard: React.FC<{ company: ClientCompanyDetails }> = ({ company }) => {
  return (
    <Card>
      {/* Company Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <BankOutlined className="text-xl text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Title level={4} className="!mb-0">{company.name}</Title>
            <Tag color={getStatusColor(company.status)}>
              {company.status.toUpperCase()}
            </Tag>
          </div>
          {company.shortName && (
            <Text type="secondary">({company.shortName})</Text>
          )}
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Basic Information */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2">
                <IdcardOutlined className="text-blue-500" />
                <span>Basic Information</span>
              </div>
            }
            className="h-full"
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="PAN Number">
                <Text copyable>{company.panNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Registered Date">
                <div className="flex items-center gap-1">
                  <CalendarOutlined />
                  <span>
                    {new Date(company.registeredDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Legal Status">
                <Tag color="blue">{formatEnumLabel(company.legalStatus)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Business Size">
                <Tag color="purple">{formatEnumLabel(company.businessSize)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                <Tag color="geekblue">{formatEnumLabel(company.industryNature)}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-green-500" />
                <span>Contact Information</span>
              </div>
            }
            className="h-full"
          >
            <div className="space-y-3">
              {company.contact.telephoneNo && (
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-gray-400" />
                  <div>
                    <Text type="secondary" className="text-xs block">Telephone</Text>
                    <Text>{company.contact.telephoneNo}</Text>
                  </div>
                </div>
              )}
              {company.contact.mobileNo && (
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-gray-400" />
                  <div>
                    <Text type="secondary" className="text-xs block">Mobile</Text>
                    <Text>{company.contact.mobileNo}</Text>
                  </div>
                </div>
              )}
              {company.contact.email && (
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-gray-400" />
                  <div>
                    <Text type="secondary" className="text-xs block">Email</Text>
                    <Text copyable>{company.contact.email}</Text>
                  </div>
                </div>
              )}
              {company.contact.website && (
                <div className="flex items-center gap-3">
                  <GlobalOutlined className="text-gray-400" />
                  <div>
                    <Text type="secondary" className="text-xs block">Website</Text>
                    <a href={company.contact.website} target="_blank" rel="noopener noreferrer">
                      {company.contact.website}
                    </a>
                  </div>
                </div>
              )}

              <Divider className="!my-3" />

              {/* Address */}
              <div className="flex items-start gap-3">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-xs block">Address</Text>
                  <Text>
                    {[
                      company.address.locality,
                      company.address.wardNo && `Ward ${company.address.wardNo}`,
                      company.address.localJurisdiction,
                      company.address.district,
                      company.address.state,
                      company.address.country
                    ].filter(Boolean).join(", ")}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Project Summary */}
        <Col xs={24}>
          <Card
            size="small"
            title={
              <div className="flex items-center gap-2">
                <ProjectOutlined className="text-purple-500" />
                <span>Project Summary</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={4}>
                <Statistic
                  title="Total"
                  value={company.projectSummary.total}
                  prefix={<ProjectOutlined />}
                />
              </Col>
              {company.projectSummary.active !== undefined && (
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Active"
                    value={company.projectSummary.active}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
              )}
              {company.projectSummary.completed !== undefined && (
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Completed"
                    value={company.projectSummary.completed}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
              )}
              {company.projectSummary.signed_off !== undefined && (
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Signed Off"
                    value={company.projectSummary.signed_off}
                    valueStyle={{ color: "#13c2c2" }}
                  />
                </Col>
              )}
              {company.projectSummary.suspended !== undefined && (
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Suspended"
                    value={company.projectSummary.suspended}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Col>
              )}
              {company.projectSummary.archived !== undefined && (
                <Col xs={12} sm={8} md={4}>
                  <Statistic
                    title="Archived"
                    value={company.projectSummary.archived}
                    valueStyle={{ color: "#8c8c8c" }}
                  />
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default ClientCompany;
