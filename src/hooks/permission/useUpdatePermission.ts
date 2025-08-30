import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editPermission } from '@/service/permission.service';

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: editPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};
