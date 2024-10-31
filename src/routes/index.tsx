import DashboardLayout from "@/components/Layout/DashboardLayout";
import SettingLayout from "@/components/Layout/SettingLayout";
import TaskGroups from "@/pages/TaskGroup";
import TaskTemplate from "@/pages/TaskTemplate";
import CreateTaskTemplate from "@/pages/TaskTemplate/new";
import CreateUser from "@/pages/User/new";
import Worklog from "@/pages/Worklog";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Perimssion from "../pages/Permission";
import Project from "../pages/Project";
import Role from "../pages/Role";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";
import CreateProject from "@/pages/Project/new";
import EditProject from "@/pages/Project/edit";
import EditTaskTemplate from "@/pages/TaskTemplate/edit";
import EditTaskGroup from "@/pages/TaskGroup/edit";
import CreateTaskGroup from "@/pages/TaskGroup/new";
import CreateRole from "@/pages/Role/new";
import EditRole from "@/pages/Role/edit";
import Client from "@/pages/Client";
import RolePermision from "@/pages/Role/role-permission";
import ProjectDetail from "@/pages/Project/detail";
import ProjectLayout from "@/components/Layout/ProjectLayout";
import NewTask from "@/pages/Task/new";
import ProjectUsers from "@/pages/Project/users";
import CreateClient from "@/pages/Client/new";
import ProtectedRoute from "./ProtectedRoute";

const Router = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <DashboardLayout>
        <PrivateRoute />
      </DashboardLayout>
    ),
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/project",
        element: <ProtectedRoute component={Project} method="get" resource="project" />
      },
      {
        path: "/project/new",
        element: <ProtectedRoute component={CreateProject} method="post" resource="project" />
      },
      {
        path: "/project/edit/:id",
        element: <ProtectedRoute component={EditProject} method="put" resource="project" />
      },
      {
        path: "/project/detail/:id",
        element: <ProtectedRoute component={ProjectDetail} method="get" resource="project" />
      },
      {
        path: "/task",
        element: <ProtectedRoute component={Task} method="get" resource="task" />
      },
      {
        path: "/task-group",
        element: <ProtectedRoute component={TaskGroups} method="get" resource="task-group" />
      },
      {
        path: "/task-group/new",
        element: <ProtectedRoute component={CreateTaskGroup} method="post" resource="task-group" />
      },
      {
        path: "/task-group/edit/:id",
        element: <ProtectedRoute component={EditTaskGroup} method="put" resource="task-group" />
      },
      {
        path: "/worklog",
        element: < ProtectedRoute component={Worklog} method="get" resource="worklog" />
      },
      {
        path: "/task-template",
        element: <ProtectedRoute component={TaskTemplate} method="get" resource="task-template" />
      },
      {
        path: "/task-template/new",
        element: <ProtectedRoute component={CreateTaskTemplate} method="post" resource="task-template" />
      },
      {
        path: "/task-template/edit/:id",
        element: <ProtectedRoute component={EditTaskTemplate} method="put" resource="task-template" />
      },
      {
        path: "/users",
        element: <ProtectedRoute component={User} method="get" resource="user" />
      },
      {
        path: "/user/new",
        element: <ProtectedRoute component={CreateUser} method="post" resource="user" />
      },
      {
        path: "/client",
        element: <ProtectedRoute component={Client} method="get" resource="client" />
      },
      {
        path: "/client/new",
        element: <ProtectedRoute component={CreateClient} method="post" resource="client" />
      },
    ],
  },
  {
    path: "/",
    element: (
      <SettingLayout>
        <PrivateRoute />
      </SettingLayout>
    ),
    children: [
      {
        path: "/role",
        element: < ProtectedRoute component={Role} method="get" resource="role" />
      },
      {
        path: "/role/new",
        element: <ProtectedRoute component={CreateRole} method="post" resource="role" />
      },
      {
        path: "/role/permission/:id",
        element: <ProtectedRoute component={RolePermision} method="get" resource="role" />
      },
      {
        path: "/role/edit/:id",
        element: <ProtectedRoute component={EditRole} method="put" resource="role" />
      },
      {
        path: "/permission",
        element: <ProtectedRoute component={Perimssion} method="get" resource="permission" />
      },
    ],
  },
  {
    path: "/project/:id",
    element: (
      <ProjectLayout>
        <PrivateRoute />
      </ProjectLayout>
    ),
    children: [
      {
        path: "users",
        element: <ProtectedRoute component={ProjectUsers} method="get" resource="project" />
      },
      {
        path: "tasks",
        element: <ProtectedRoute component={Task} method="get" resource="task" />
      },
      {
        path: "tasks/new",
        element: <ProtectedRoute component={NewTask} method="post" resource="task" />
      },
    ],
  },
];

export default Router;



