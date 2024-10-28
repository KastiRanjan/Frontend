import { useSession } from "@/context/SessionContext";
import { checkPermissionForComponent } from "@/utils/permission";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { isAuthenticated, loading,profile: user } = useSession();



  if (loading) {
    return <></>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to={"/login"} />;
};

export default PrivateRoute;
