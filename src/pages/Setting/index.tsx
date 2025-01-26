import { Card, Col, Row } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";

const Setting = () => {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card className="h-full">
          <svg className="admin-icon-prop">
            <use></use>
          </svg>
          <Title level={4} className="text-blue-600">
            {" "}
            Users & Permissions
          </Title>
          <Paragraph>
            Roles Users GroupsTechnician GroupsFine-Grained AccessPrivacy
            Settings
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
