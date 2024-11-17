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
import TaskTemplate from "@/pages/TaskTemplate";
import EditTaskTemplate from "@/pages/TaskTemplate/edit";
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
import Attendence from "@/pages/Attendence";
import AllWorklogs from "@/pages/Worklog/AllWorklogs";
import TaskDetails from "@/pages/Task/task-details";
import UserDetails from "@/pages/User/details";
import AccountDetails from "@/pages/User/AccountDetails";
import ResetPasswordForm from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import Setting from "@/pages/Setting";
import Request from "@/pages/Request";

const Router = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset/:token",
    element: <ResetPasswordForm />,
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
        path: "/project/edit/:id",
        element: <ProtectedRoute method="patch" resource="projects" component={<EditProject />} />
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
        path: "/requests",
        element: <Request />,
      },
      {
        path: "/task-template",
        element: <ProtectedRoute method="get" resource="task-group" component={<TaskGroups />} />,
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
        path: "/task-template/:id",
        element: <ProtectedRoute method="get" resource="task-template" component={<TaskTemplate />} />
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
        path: "/user/:id",
        element: <UserDetails />,
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
        path: "/attendance",
        element: <Attendence />,
      },
      {
        path: "worklogs-all",
        element: <AllWorklogs />,
      },
      {
        path: "worklogs/new",
        element: <NewWorklog />,
      },
      {
        path: "/projects/:id",
        element: <ProjectDetail />,
      },
      {
        path: "/projects/:id/users",
        element: <ProjectUsers />,
      },
      {
        path: "/projects/:id/tasks",
        element: <Task />,
      },
      {
        path: "/projects/:pid/tasks/:tid",
        element: <TaskDetails />,
      },
      {
        path: "/projects/:id/tasks/new",
        element: <NewTask />,
      },
      {
        path: "/projects/:id/worklogs",
        element: <Worklog />,
      },
      {
        path: "/projects/:id/worklogs/new",
        element: <NewWorklog />,
      },
      {
        path: "/profile/:id",
        element: <Profile />,
      },
      {
        path: "/account-detail/:id",
        element: <AccountDetails />,
      },
      {
        path: "/personal-detail:id",
        element: <PersonalDetails />,
      },
      {
        path: "/educational-detail/:id",
        element: <EducationalDetails />,
      },
      {
        path: "/bank-detai/:id",
        element: <BankDetails />,
      },
      {
        path: "/training-detail:id",
        element: <TrainingDetails />,
      },
      {
        path: "/settings",
        element: <Setting />,
      },
    ],
  },
];

export default Router;
