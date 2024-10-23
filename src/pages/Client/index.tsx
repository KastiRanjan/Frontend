import ClientTable from "@/components/Client/ClientTable";
import PageTitle from "@/components/PageTitle";
import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const Client: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Clients"
        element={
          <Button type="primary" onClick={() => navigate("/client/new")}>
            Create
          </Button>
        }
      />

      <ClientTable />
    </>
  );
};

export default Client;
