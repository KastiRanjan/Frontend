import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const backendURI = import.meta.env.VITE_BACKEND_URI;

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
    displayName?: string;
  };
}

const fetchManagers = async (): Promise<Manager[]> => {
  const response = await axios.get(`${backendURI}/users/role/manager`);
  return response.data;
};

export const useManagers = () => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: fetchManagers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};