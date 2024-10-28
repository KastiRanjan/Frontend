import { useSession } from "@/context/SessionContext";
import { checkPermissionForComponent } from "@/utils/permission";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ path, resource, method, defaultPermission }: any) => {
  const { isAuthenticated, loading,profile: user } = useSession();

  const [permitted, setPermitted] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setPermitted(
        checkPermissionForComponent(user.role, {
          path,
          resource,
          method,
          defaultPermission,
        })
      );
    }
  }, [user, path]);

  if (loading) {
    return <></>;
  }
  if (!permitted) {
    return <>Not Permitted</>
  }

  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to={"/login"} />;
};

export default PrivateRoute;
