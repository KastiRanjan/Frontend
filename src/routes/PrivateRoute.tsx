import { useSession } from "@/context/SessionContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSession();
  console.log(loading);
  if (loading) {
    return <></>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to={"/login"} />;
};

export default PrivateRoute;
