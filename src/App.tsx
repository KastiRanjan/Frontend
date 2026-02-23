import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from "react-router-dom";
import Router from "./routes";
import { useSession } from "./context/SessionContext";
import { ClientAuthProvider, useClientAuth } from "./context/ClientAuthContext";
import { antTheme } from "./theme";
import { useTrackUserActivity } from "./utils/userActivityTracker";
import { isClientPortalDomain, isClientOnlyRoute } from "./utils/subdomainConfig";
import "react-quill/dist/quill.snow.css";

const AppContent: React.FC = () => {
  const routes = useRoutes(Router);
  const { isAuthenticated, loading } = useSession();
  const { isClientAuthenticated, isLoading: isClientLoading } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track user activity if authenticated
  useTrackUserActivity();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Check if we're on the client portal subdomain (e.g., client.artha.com.np)
    const isOnClientSubdomain = isClientPortalDomain();
    const isOnClientRoute = isClientOnlyRoute(pathname);
    const clientPublicRoutes = ["/client-login", "/client-forgot-password"];
    const isClientResetRoute = /^\/client\/reset-password\//.test(pathname);
    
    // If on client subdomain (client.artha.com.np)
    if (isOnClientSubdomain) {
      // If trying to access non-client routes, redirect to client login
      if (!isOnClientRoute) {
        navigate('/client-login', { replace: true });
        return;
      }
      // Don't apply staff auth logic on client subdomain
      return;
    }
    
    // Handle client authentication redirect (for client routes on main domain)
    if (isOnClientRoute && !isClientLoading) {
      if (isClientAuthenticated && pathname === "/client-login") {
        console.log('App: Client is authenticated, redirecting from client-login to client-portal');
        navigate("/client-portal", { replace: true });
        return;
      } else if (
        !isClientAuthenticated &&
        ![...clientPublicRoutes, ...(isClientResetRoute ? [pathname] : [])].includes(pathname)
      ) {
        console.log('App: Client is not authenticated, redirecting to client-login');
        navigate("/client-login", { replace: true });
        return;
      }
    }
    
    // Staff portal routes (task.artha.com.np)
    const publicRoutes = ["/login", "/signup", "/forgot-password"];
    const isResetRoute = /^\/reset\//.test(pathname);
    
    // Don't redirect while session is still loading (prevents redirect on page reload)
    if (loading) return;
    
    // Redirect authenticated users away from login page
    if (isAuthenticated && pathname === "/login") {
      console.log('App: User is authenticated, redirecting from login to home');
      navigate("/", { replace: true });
    } else if (
      !isAuthenticated &&
      ![...publicRoutes, ...(isResetRoute ? [pathname] : [])].includes(pathname) &&
      !isOnClientRoute
    ) {
      console.log('App: User is not authenticated, redirecting to login');
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isClientAuthenticated, isClientLoading, loading, navigate, location.pathname]);

  return routes;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={antTheme}>
      <ClientAuthProvider>
        <AppContent />
      </ClientAuthProvider>
    </ConfigProvider>
  );
};

export default App;