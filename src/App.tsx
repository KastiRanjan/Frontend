import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from "react-router-dom";
import Router from "./routes";
import { useSession } from "./context/SessionContext";
import { ClientAuthProvider } from "./context/ClientAuthContext";
import { antTheme } from "./theme";
import { useTrackUserActivity } from "./utils/userActivityTracker";
import { isClientPortalDomain, isClientOnlyRoute } from "./utils/subdomainConfig";
import "react-quill/dist/quill.snow.css";

const App: React.FC = () => {
  const routes = useRoutes(Router);
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track user activity if authenticated
  useTrackUserActivity();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Check if we're on the client portal domain/subdomain
    const isOnClientDomain = isClientPortalDomain();
    const isOnClientRoute = isClientOnlyRoute(pathname);
    
    // If on client subdomain but not on client route, redirect to client login
    if (isOnClientDomain && pathname === '/') {
      navigate('/client-login');
      return;
    }
    
    // If on client subdomain, don't apply staff auth logic
    if (isOnClientRoute) {
      return;
    }
    
    // Staff portal routes
    const publicRoutes = ["/login", "/signup", "/forgot-password"];
    const isResetRoute = /^\/reset\//.test(pathname);
    
    if (isAuthenticated && pathname === "/login") {
      navigate("/");
    } else if (
      !isAuthenticated &&
      ![...publicRoutes, ...(isResetRoute ? [pathname] : [])].includes(pathname)
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return (
    <ConfigProvider theme={antTheme}>
      <ClientAuthProvider>
        {routes}
      </ClientAuthProvider>
    </ConfigProvider>
  );
};

export default App;