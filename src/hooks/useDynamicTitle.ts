import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitleMap: Record<string, string> = {
  '/': 'Home',
  '/users': 'Users',
  '/projects': 'Project', // The user requested "Project" for the projects page
  '/task': 'Task',
  '/tasks': 'Tasks',
  '/requests': 'Requests',
  '/task-template': 'Task Templates',
  '/client': 'Clients',
  '/billing': 'Billing',
  '/attendance': 'Attendance',
  '/calendar': 'Calendar',
  '/settings': 'Settings',
  '/permission': 'Permissions',
  '/role': 'Roles',
  '/leave-management': 'Leave Management',
  '/todotask': 'Todo Tasks',
  '/notice-board': 'Notice Board',
  '/client-reports': 'Client Reports',
  '/client-portal': 'Client Portal',
  '/client-login': 'Login',
  '/login': 'Login',
  '/forgot-password': 'Forgot Password',
};

export const useDynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Exact match
    if (routeTitleMap[currentPath]) {
      document.title = routeTitleMap[currentPath];
      return;
    }

    // Dynamic routes matching (e.g., /projects/new -> Project)
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length > 0) {
      const baseRoute = `/${segments[0]}`;
      // Special mappings for dynamic routes
      if (baseRoute === '/projects' || baseRoute === '/project') {
        document.title = 'Project';
      } else if (baseRoute === '/users' || baseRoute === '/user') {
        document.title = 'User';
      } else if (baseRoute === '/client') {
        document.title = 'Client';
      } else if (baseRoute === '/task' || baseRoute === '/tasks') {
        document.title = 'Task';
      } else {
        // Fallback: Capitalize the first segment
        document.title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, ' ');
      }
    } else {
      document.title = 'Home'; // Fallback for empty path
    }
  }, [location.pathname]);
};
