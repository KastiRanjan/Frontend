import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from '../../context/SessionContext';

const backendURI = import.meta.env.VITE_BACKEND_URI;

interface Approver {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: {
    name: string;
    displayName?: string;
  };
}

const fetchManagersAndAdmins = async (): Promise<Approver[]> => {
  try {
    // Try to fetch all users and filter by role
    const usersResponse = await axios.get(`${backendURI}/users`);
    console.log('All users response:', usersResponse.data);
    
    // Extract users from the results array
    const users = usersResponse.data.results || usersResponse.data;
    console.log('Extracted users:', users);
    
    // Filter users with relevant roles
    const approvers = users.filter((user: any) => {
      const roleName = user.role?.name?.toLowerCase();
      return roleName === 'projectmanager' || 
             roleName === 'administrator' || 
             roleName === 'superuser';
    });
    
    console.log('Filtered approvers:', approvers);
    return approvers;
  } catch (error) {
    console.error('Error fetching approvers:', error);
    return [];
  }
};

export const useApprovers = () => {
  const { profile } = useSession();
  
  return useQuery({
    queryKey: ['all-approvers'],
    queryFn: fetchManagersAndAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      const userRole = (profile as any)?.role?.name?.toLowerCase();
      console.log('Current user role:', userRole);
      
      // Role-based filtering based on hierarchy
      let filteredUsers;
      if (userRole === 'projectmanager') {
        // Project managers can request to administrators and superusers
        filteredUsers = data.filter(user => 
          user.role.name.toLowerCase() === 'administrator' || 
          user.role.name.toLowerCase() === 'superuser'
        );
      } else if (userRole === 'administrator') {
        // Administrators can only request to superusers
        filteredUsers = data.filter(user => user.role.name.toLowerCase() === 'superuser');
      } else {
        // Regular employees (others) can only request to project managers
        filteredUsers = data.filter(user => 
          user.role.name.toLowerCase() === 'projectmanager'
        );
      }
      
      console.log('Filtered approvers for role', userRole, ':', filteredUsers);
      return filteredUsers;
    }
  });
};