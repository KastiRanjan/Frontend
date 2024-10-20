import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import React from "react";
import { useRoutes } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import Router from "./routes";

const App: React.FC = () => {
  const routes = useRoutes(Router);
  return (
    <ConfigProvider theme={{ token: { fontFamily: '"Inter", sans-serif' } }}>
      <SessionProvider>{routes}</SessionProvider>
    </ConfigProvider>
  );
};

export default App;
