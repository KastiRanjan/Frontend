import { Button, Card, Col, Row,Typography } from "antd";
import { useNavigate } from "react-router-dom";
const { Title, Paragraph } = Typography;



const Setting = () => {
  
  const navigate = useNavigate();
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card className="h-full" onClick={() => navigate("/role")} hoverable>
          <Title level={4} className="text-blue-600">
            Roles & Permissions
          </Title>
          <Paragraph>
            Manage roles and assign permissions to control access.
          </Paragraph>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="h-full" onClick={() => navigate("/permission")} hoverable>
          <Title level={4}>Permissions</Title>
          <Paragraph>
            Create and edit permissions for resources.
          </Paragraph>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="h-full">
          <svg className="admin-icon-prop">
            <use></use>
          </svg>
          <Title level={4}>Mail Settings</Title>
          <Paragraph>
            Mail Server SettingsMail AddressesMail BoxMail FilterEmail Command
          </Paragraph>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="h-full">
          <svg className="admin-icon-prop">
            <use></use>
          </svg>
          <Title level={4}>General Settings</Title>
          <Paragraph>
            Advanced Portal SettingsRequester PortalTheme SettingsCloud
            AttachmentsApproval Settings
          </Paragraph>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="h-full">
          <svg className="admin-icon-prop">
            <use></use>
          </svg>
          <Title level={4}>Instance Configuration</Title>
          <Paragraph>
            Instance SettingsRegionsSitesOperational HoursHoliday GroupsLeave
            TypesDepartmentsCurrencyOrganization Roles
          </Paragraph>
        </Card>
      </Col>
    </Row>
  );
};

export default Setting;
