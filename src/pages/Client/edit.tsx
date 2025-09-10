import ClientForm from "@/components/Client/ClientForm";
import PageTitle from "@/components/PageTitle";
import PortalCredentialsForm from "@/components/client/portalcredentialsform";
import { useClientById } from "@/hooks/client/useClientById";
import { Button, Card, Tabs } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { TabPane } = Tabs;

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("basic");

  const { data: client } = useClientById({ id: id });

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <>
      <PageTitle
        title="Edit Client"
        element={
          <Button type="primary" onClick={() => navigate(-1)}>
            Close
          </Button>
        }
      />

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Basic Information" key="basic">
          <ClientForm editClientData={client} id={id} />
        </TabPane>
        <TabPane tab="Portal Credentials" key="credentials">
          <Card>
            <PortalCredentialsForm clientId={id || ""} />
          </Card>
        </TabPane>
      </Tabs>
    </>
  );
};

export default EditClient;
