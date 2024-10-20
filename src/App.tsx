import React, { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/navbar/index';
import AppRoutes from './routes/AppRoutes';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return <AppRoutes />;
};

const WrappedApp: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {!isLoginPage && (
        <div style={{ width: isCollapsed ? '80px' : '250px', transition: 'width 0.3s' }}>
          <Navbar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        </div>
      )}
      <div
        style={{
          flexGrow: 1,
          transition: 'margin-left 0.3s',
          padding: '1px' // Optional padding for content
        }}
      >
        <App />
      </div>
    </div>
  );
};

const Main: React.FC = () => (
  <Router>
    <WrappedApp />
  </Router>
);

export default Main;
