import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const backendURI = import.meta.env.VITE_BACKEND_URI;

const deletePermission = async (id: string) => {
  const response = await axios.delete(`${backendURI}/permissions/${id}`);
  return response.data;
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};
