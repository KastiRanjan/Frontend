// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Project';
// import Users from '../pages/User';
import Roles from '../pages/Role';
import Permissions from '../pages/Permission';
import Tasks from '../pages/Task';
import Worklogs from '../pages/Worklog';
import LoginPage from '../pages/Login';
import UserTable from '../pages/User';
import TaskGroup from '../pages/TaskGroup';
import TaskTemplate from '../pages/TaskTemplate';


const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/users" element={<UserTable />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/permissions" element={<Permissions />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/worklogs" element={<Worklogs />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks/tasktemplate" element={<TaskTemplate />} />
      <Route path="/tasks/taskgroup" element={<TaskGroup />} />
    </Routes>
  );
};

export default AppRoutes;
