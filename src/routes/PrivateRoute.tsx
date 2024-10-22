import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useSession } from "@/context/SessionContext";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSession();

  if (loading) {
    return <></>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to={"/login"} />;
};

export default PrivateRoute;
