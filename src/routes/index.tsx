import DashboardLayout from "@/components/Layout/DashboardLayout";
import ProjectLayout from "@/components/Layout/ProjectLayout";
import UserLayout from "@/components/Layout/UserLayout";
import Client from "@/pages/Client";
import EditClient from "@/pages/Client/edit";
import CreateClient from "@/pages/Client/new";
import ProjectDetail from "@/pages/Project/detail";
import EditProject from "@/pages/Project/edit";
import CreateProject from "@/pages/Project/new";
import ProjectUsers from "@/pages/Project/users";
import NewTask from "@/pages/Task/new";
import TaskGroups from "@/pages/TaskGroup";
import EditTaskGroup from "@/pages/TaskGroup/edit";
import CreateTaskGroup from "@/pages/TaskGroup/new";
import TaskTemplate from "@/pages/TaskTemplate";
import EditTaskTemplate from "@/pages/TaskTemplate/edit";
import CreateTaskTemplate from "@/pages/TaskTemplate/new";
import BankDetails from "@/pages/User/BankDetails";
import EducationalDetails from "@/pages/User/EducationalDetails";
import CreateUser from "@/pages/User/new";
import PersonalDetails from "@/pages/User/PersonalDetails";
import TrainingDetails from "@/pages/User/TrainingDetails";
import Worklog from "@/pages/Worklog";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Project from "../pages/Project";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";
import ProtectedRoute from "./ProtectedRoute";
import NewWorklog from "@/pages/Worklog/new";

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
        element: <ProtectedRoute method="get" resource="user" component={<Dashboard />} />,
      },

      {
        path: "/projects",
        element: <ProtectedRoute method="get" resource="projects" component={<Project />} />,
      },
      {
        path: "/tasks",
        element: <ProtectedRoute method="get" resource="projects" component={<Task />} />,
      },
      {
        path: "/projects/new",
        element: <ProtectedRoute method="post" resource="projects" component={<CreateProject />} />,
      },
      {
        path: "/projects/edit/:id",
        element: <ProtectedRoute method="patch" resource="project" s component={<EditProject />} />
      },
      {
        path: "/project/detail/:id",
        element: <ProjectDetail />,
      },
      {
        path: "/task",
        element: <Task />,
      },
      {
        path: "/task-group",
        element: <ProtectedRoute method="get" resource="task-group" component={<TaskGroups />} />,
      },
      {
        path: "/task-group/new",
        element: <CreateTaskGroup />,
      },
      {
        path: "/task-group/edit/:id",
        element: <EditTaskGroup />,
      },
      {
        path: "/project/:id/task/:id/worklog",
        element: <Worklog />,
      },
      {
        path: "/task-template",
        element: <ProtectedRoute method="get" resource="task-template" component={<TaskTemplate />} />
      },
      {
        path: "/task-template/new",
        element: <ProtectedRoute method="post" resource="task-template" component={<CreateTaskTemplate />} />,
      },
      {
        path: "/task-template/edit/:id",
        element: <ProtectedRoute method="patch" resource="task-template" component={<EditTaskTemplate />} />,
      },
      {
        path: "/users",
        element: <ProtectedRoute method="get" resource="user" component={<User />} />,
      },
      {
        path: "/user/new",
        element: <ProtectedRoute method="post" resource="user" component={<CreateUser />} />
      },
      {
        path: "/user/edit/:id",
        element: <>Edit</>,
      },
      {
        path: "/client",
        element: <Client />,
      },
      {
        path: "/client/new",
        element: <CreateClient />,
      },
      {
        path: "/client/edit/:id",
        element: <EditClient />,
      },
      {
        path: "/settings",
        element: <>setting</>,
      },
    ],
  },
  // {
  //   path: "/",
  //   element: (
  //     <SettingLayout>
  //       <PrivateRoute />
  //     </SettingLayout>
  //   ),
  //   children: [
  //     {
  //       path: "/role",
  //       element: <Role />,
  //     },
  //     {
  //       path: "/role/new",
  //       element: <CreateRole />,
  //     },
  //     {
  //       path: "/role/permission/:id",
  //       element: <RolePermision />,
  //     },
  //     {
  //       path: "/role/edit/:id",
  //       element: <EditRole />,
  //     },
  //     {
  //       path: "/permission",
  //       element: <Perimssion />,
  //     },
  //   ],
  // },
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
        element: <ProjectUsers />,
      },
      {
        path: "tasks",
        element: <Task />,
      },
      {
        path: "tasks/new",
        element: <NewTask />,
      },
      {
        path: "worklogs",
        element: <Worklog />,
      },
      {
        path: "worklogs/new",
        element: <NewWorklog />,
      },
    ],
  },
  {
    path: "/user/:id",
    element: (
      <UserLayout>
        <PrivateRoute />
      </UserLayout>
    ),
    children: [
      {
        path: "personal-detail",
        element: <PersonalDetails />,
      },
      {
        path: "educational-detail",
        element: <EducationalDetails />,
      },
      {
        path: "bank-detail",
        element: <BankDetails />,
      },
      {
        path: "training-detail",
        element: <TrainingDetails />,
      },

    ],
  },
];

export default Router;
