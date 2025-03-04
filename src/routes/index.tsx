import DashboardLayout from "@/components/Layout/DashboardLayout";
import Attendence from "@/pages/Attendence";
import Client from "@/pages/Client";
import EditClient from "@/pages/Client/edit";
import CreateClient from "@/pages/Client/new";
import Profile from "@/pages/Profile";
import ProjectDetail from "@/pages/Project/detail";
import EditProject from "@/pages/Project/edit";
import CreateProject from "@/pages/Project/new";
import ProjectUsers from "@/pages/Project/users";
import Request from "@/pages/Request";
import ResetPasswordForm from "@/pages/ResetPassword";
import Setting from "@/pages/Setting";
import AllTask from "@/pages/Task/all";
import NewTask from "@/pages/Task/new";
import TaskDetails from "@/pages/Task/task-details";
import TaskGroups from "@/pages/TaskGroup";
import EditTaskGroup from "@/pages/TaskGroup/edit";
import TaskTemplate from "@/pages/TaskTemplate";
import EditTaskTemplate from "@/pages/TaskTemplate/edit";
import AccountDetails from "@/pages/User/AccountDetails";
import BankDetails from "@/pages/User/BankDetails";
import UserDetails from "@/pages/User/details";
import EducationalDetails from "@/pages/User/EducationalDetails";
import CreateUser from "@/pages/User/new";
import PersonalDetails from "@/pages/User/PersonalDetails";
import TrainingDetails from "@/pages/User/TrainingDetails";
import Worklog from "@/pages/Worklog";
import AllWorklogs from "@/pages/Worklog/AllWorklogs";
import NewWorklog from "@/pages/Worklog/new";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Project from "../pages/Project";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";
import ProtectedRoute from "./ProtectedRoute";

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
        element: (
          <ProtectedRoute
            method="get"
            resource="user"
            component={<Dashboard />}
          />
        ),
      },

      {
        path: "/projects",
        element: (
          <ProtectedRoute
            method="get"
            resource="projects"
            component={<Project />}
          />
        ),
      },
      {
        path: "/projects/new",
        element: (
          <ProtectedRoute
            method="post"
            resource="projects"
            component={<CreateProject />}
          />
        ),
      },
      {
        path: "/project/edit/:id",
        element: (
          <ProtectedRoute
            method="patch"
            resource="projects"
            component={<EditProject />}
          />
        ),
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
        path: "/tasks",
        element: <AllTask />,
      },
      {
        path: "/requests",
        element: <Request />,
      },
      {
        path: "/task-template",
        element: (
          <ProtectedRoute
            method="get"
            resource="task-group"
            component={<TaskGroups />}
          />
        ),
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
        element: (
          <ProtectedRoute
            method="get"
            resource="task-template"
            component={<TaskTemplate />}
          />
        ),
      },

      {
        path: "/task-template/edit/:id",
        element: (
          <ProtectedRoute
            method="patch"
            resource="task-template"
            component={<EditTaskTemplate />}
          />
        ),
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute method="get" resource="user" component={<User />} />
        ),
      },
      {
        path: "/user/new",
        element: (
          <ProtectedRoute
            method="post"
            resource="user"
            component={<CreateUser />}
          />
        ),
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
        element: <Profile component={PersonalDetails}/>,
      },
      {
        path: "/account-detail/:id",
        element: <AccountDetails />,
      },
      {
        path: "profile/:id/personal-detail",
        element: <Profile component={PersonalDetails}/>,
      },
      {
        path: "profile/:id/educational-detail",
        element: <Profile component={EducationalDetails}/>,
      },
      {
        path: "profile/:id/bank-detail",
        element: <Profile component={BankDetails} />,
      },
      {
        path: "profile/:id/training-detail",
        element: <Profile component={TrainingDetails} />,
      
      },
      {
        path: "/settings",
        element: <Setting />,
      },
    ],
  },
];

export default Router;




