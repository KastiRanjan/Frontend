import ClientTable from "@/components/Client/ClientTable";
import PageTitle from "@/components/PageTitle";
import React from "react";
import { useNavigate } from "react-router-dom";

const Client: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Clients"

      />

      <ClientTable />
    </>
  );
};

export default Client;
