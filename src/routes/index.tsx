import TaskGroups from "@/pages/TaskGroup";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Perimssion from "../pages/Permission";
import Project from "../pages/Project";
import Role from "../pages/Role";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";
import Worklog from "@/pages/Worklog";
import TaskTemplate from "@/pages/TaskTemplate";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import SettingLayout from "@/components/Layout/SettingLayout";
import CreateUser from "@/pages/User/new";

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
        path: "/role",
        element: <Role />,
      },
      {
        path: "/permission",
        element: <Perimssion />,
      },
      {
        path: "/project",
        element: <Project />,
      },
      {
        path: "/task",
        element: <Task />,
      },
      {
        path: "/taskgroup",
        element: <TaskGroups />,
      },
      {
        path: "/worklog",
        element: <Worklog />,
      },
      {
        path: "/tasktemplate",
        element: <TaskTemplate />,
      },
      {
        path: "/user",
        element: <User />,
      },
      {
        path: "/user/new",
        element: <CreateUser />,
      },
      {
        path: "/user/edit/:id",
        element: <>Edit</>,
      },
      {
        path: "/settings",
        element: <>setting</>,
      },
    ],
  },
  {
    path: "/settings",
    element: (
      <SettingLayout>
        <PrivateRoute />
      </SettingLayout>
    ),
    children: [
      {
        path: "",
        element: <>setting</>,
      },
    ],
  },
];

export default Router;
