import ClientTable from "@/components/Client/ClientTable";
import PageTitle from "@/components/PageTitle";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Client } from "./type";

const { TabPane } = Tabs;

const ClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("active");

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const handleCreate = () => {
    navigate("/client/new");
  };

  return (
    <>
      <PageTitle
        title="Clients"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create
          </Button>
        }
      />

      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="Active" key="active">
          <ClientTable status="active" />
        </TabPane>
        <TabPane tab="Suspended" key="suspended">
          <ClientTable status="suspended" />
        </TabPane>
        <TabPane tab="Archived" key="archive">
          <ClientTable status="archive" />
        </TabPane>
      </Tabs>
    </>
  );
};

export default ClientPage;
