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
    if (isAuthenticated && window.location.pathname === "/login") {
      navigate("/");
    } else if (
      !isAuthenticated &&
      !["/login", "/signup", ...window.location.pathname.match(/^\/reset\//) ? [window.location.pathname] : []].includes(window.location.pathname)
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return <ConfigProvider theme={antTheme}>{routes}</ConfigProvider>;
};

export default App;