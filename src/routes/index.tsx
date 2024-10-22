import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Perimssion from "../pages/Permission";
import Project from "../pages/Project";
import Role from "../pages/Role";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";

const Router = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
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
        path: "/user",
        element: <User />,
        children: [
          {
            path: "new",
            element: <User />,
          },
        ],
      },
    ],
  },
];

export default Router;
