import ProjectTimelinePage from "@/pages/Project/timeline";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Attendence from "@/pages/Attendence";
import Billing from "@/pages/Billing";
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
import ProjectSetting from "@/pages/Setting/ProjectSetting";
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
import ContractDetails from "@/pages/User/ContractDetails";
import WorkHourDetails from "@/pages/User/WorkHourDetails";
import LeaveManagement from "@/pages/Leave/LeaveManagement";
import Worklog from "@/pages/Worklog";
import AllWorklogs from "@/pages/Worklog/AllWorklogs";
import NewWorklog from "@/pages/Worklog/new";
import CalendarPage from "@/pages/Calendar";
import WorkhourSettingsPage from "@/pages/Workhour/settings";
import HolidayPage from "@/pages/Holiday";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Project from "../pages/Project";
import Task from "../pages/Task";
import User from "../pages/User";
import PrivateRoute from "./PrivateRoute";
import ProtectedRoute from "./ProtectedRoute";
import EditWorklog from "@/pages/Worklog/edit";
import Perimssion from "@/pages/Permission";
import RolePermision from "@/pages/Role/role-permission";
import RolesPage from "@/pages/Role";
import CreateRole from "@/pages/Role/new";
import EditRole from "@/pages/Role/edit";
import PermissionAssignmentManager from "@/pages/Permission/AssignmentManager";
import LeaveTypeManagementPage from "@/pages/LeaveTypeManagementPage";

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
        path: "/billing",
        element: (
          <ProtectedRoute
            method="get"
            resource="billing"
            component={<Billing />}
          />
        ),
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
        path: "worklogs/edit/:id",
        element: <EditWorklog />,
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
        path: "profile/:id/workhour-detail",
        element: <Profile component={WorkHourDetails} />,
      },
      {
        path: "profile/:id/leave-detail",
        element: <Profile component={LeaveManagement} />,
      },
      {
        path: "profile/:id/contract-detail",
        element: <Profile component={ContractDetails} />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
      {
        path: "/settings",
        element: <Setting />,
      },
      {
        path: "/project-setting",
        element: <ProjectSetting />,
      },
      {
        path: "/workhour-settings",
        element: (
          <ProtectedRoute
            method="get"
            resource="workhour"
            component={<WorkhourSettingsPage />}
          />
        ),
      },
      {
        path: "/holiday",
        element: (
          <ProtectedRoute
            method="get"
            resource="holiday"
            component={<HolidayPage />}
          />
        ),
      },
       {
  path: "/permission",
  element: <Perimssion />,
},
{
  path: "/permission/assign",
  element: (
    <ProtectedRoute
      method="get"
      resource="permission"
      component={<PermissionAssignmentManager />}
    />
  ),
},
{
  path: "/role",
  element: <RolesPage />,
},
{
  path: "/role/new",
  element: <CreateRole />,
},
{
  path: "/role/edit/:id",
  element: <EditRole />,
},
{
  path: "/role/permission/:id",
  element: <RolePermision />,
},
{
  path: "/leave-types",
  element: (
    <ProtectedRoute
      method="get"
      resource="leave-type"
      component={<LeaveTypeManagementPage />}
    />
  ),
},
{
  path: "/leave-management",
  element: (
    <ProtectedRoute
      method="get"
      resource="leave"
      component={<LeaveManagement />}
    />
  ),
},
    ],
    
  },
];

export default Router;




 