import PageTitle from "@/components/PageTitle";
import RoleTable from "@/components/Role/RoleTable";
import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Role {
  createdAt: string;
  name: string;
  description: string;
}

const RolesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageTitle
        title="Roles"
        element={
          <Button
            type="primary"
            onClick={() => {
              navigate("/role/new");
            }}
          >
            Create
          </Button>
        }
      />
      <RoleTable />
    </>
  );
};

export default RolesPage;
