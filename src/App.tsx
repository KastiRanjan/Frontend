import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import Router from "./routes";
import { useSession } from "./context/SessionContext";
import { antTheme } from "./theme";

const App: React.FC = () => {
  const routes = useRoutes(Router);
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (window.location.pathname.includes("/login")) {
        navigate("/");
      }
    }
  }, [isAuthenticated]);
  return <ConfigProvider theme={antTheme}>{routes}</ConfigProvider>;
};

export default App;
