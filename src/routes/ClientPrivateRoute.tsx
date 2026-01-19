import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spin } from "antd";
import { useClientAuth } from "@/context/ClientAuthContext";

const ClientPrivateRoute: React.FC = () => {
  const { isClientAuthenticated, isLoading } = useClientAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!isClientAuthenticated) {
    return <Navigate to="/client-login" replace />;
  }

  return <Outlet />;
};

export default ClientPrivateRoute;
