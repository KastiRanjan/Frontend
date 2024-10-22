import PageTitle from "@/components/PageTitle";
import UserTable from "@/components/user/UserTable";
import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

interface UserRole {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
  name: string;
  avatar: string | null;
  status: string;
  isTwoFAEnabled: boolean;
  role: UserRole;
}

const User: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Users"
        element={
          <Button type="primary" onClick={() => navigate("/user/new")}>
            Add
          </Button>
        }
      />

      <UserTable />
    </>
  );
};

export default User;
