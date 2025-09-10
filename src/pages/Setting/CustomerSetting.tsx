import React from "react";
import { Card, Typography, Tabs } from "antd";
import BusinessSizeManager from "../../components/customer/BusinessSizeManager";
import BusinessNatureManager from "../../components/customer/BusinessNatureManager";
import LegalStatusManager from "../../components/customer/LegalStatusManager";

const { Title } = Typography;
const { TabPane } = Tabs;

const CustomerSetting: React.FC = () => {
  return (
    <Card>
      <Title level={3}>Customer Settings</Title>
      <Tabs defaultActiveKey="businessSize">
        <TabPane tab="Business Size" key="businessSize">
          <BusinessSizeManager />
        </TabPane>
        <TabPane tab="Business Nature" key="businessNature">
          <BusinessNatureManager />
        </TabPane>
        <TabPane tab="Legal Status" key="legalStatus">
          <LegalStatusManager />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CustomerSetting;
