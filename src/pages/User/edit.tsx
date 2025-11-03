import { useParams, useNavigate } from "react-router-dom";
import { Card, Tabs, Button, Space, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import PersonalDetailForm from "@/components/user/PersonalDetailForm";
import BankDetailForm from "@/components/user/BankDetailForm";
import EducationDetailForm from "@/components/user/EducationDetailForm";
import TrainningDetailForm from "@/components/user/TrainningDetailForm";
import UserDocumentForm from "@/components/user/UserDocumentForm";
import ContractDetailForm from "@/components/user/ContractDetailForm";
import Title from "antd/es/typography/Title";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUserDetails(id);
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "profile",
      label: "Profile Details",
      children: <PersonalDetailForm initialValues={user?.profile} userData={user} />,
    },
    {
      key: "bank",
      label: "Bank Details",
      children: <BankDetailForm initialValues={user?.bank_detail} />,
    },
    {
      key: "education",
      label: "Education Details",
      children: <EducationDetailForm initialValues={user?.education_detail} />,
    },
    {
      key: "training",
      label: "Training & Certificates",
      children: <TrainningDetailForm initialValues={user?.trainning_detail} />,
    },
    {
      key: "documents",
      label: "Personal Documents",
      children: <UserDocumentForm initialValues={user?.document} />,
    },
    {
      key: "contracts",
      label: "Contracts",
      children: <ContractDetailForm initialValues={user?.contract_detail?.[0]} />,
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/user/${id}`)}
            >
              Back to Details
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              Edit User: {user?.name}
            </Title>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default UserEdit;
