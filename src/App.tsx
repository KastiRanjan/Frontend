import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import Router from "./routes";
import { useSession } from "./context/SessionContext";
import { antTheme } from "./theme";
import { useTrackUserActivity } from "./utils/userActivityTracker";
import "react-quill/dist/quill.snow.css";

const App: React.FC = () => {
  const routes = useRoutes(Router);
  const { isAuthenticated, profile } = useSession();
  const navigate = useNavigate();
  
  // Track user activity if authenticated
  useTrackUserActivity();

  useEffect(() => {
    const publicRoutes = ["/login", "/signup", "/forgot-password"];
    // Allow /reset/:token as public route
    const isResetRoute = /^\/reset\//.test(window.location.pathname);
    if (isAuthenticated && window.location.pathname === "/login") {
      navigate("/");
    } else if (
      !isAuthenticated &&
      ![...publicRoutes, ...(isResetRoute ? [window.location.pathname] : [])].includes(window.location.pathname)
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return <ConfigProvider theme={antTheme}>{routes}</ConfigProvider>;
};

export default App;