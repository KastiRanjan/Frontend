import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const backendURI = import.meta.env.VITE_BACKEND_URI;

const syncPermissions = async () => {
  const response = await axios.post(`${backendURI}/permissions/sync`);
  return response.data;
};

export const useSyncPermissions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: syncPermissions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};
