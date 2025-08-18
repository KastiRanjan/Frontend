import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRolePermissions } from "../../service/role.service";

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: number[] }) =>
      updateRolePermissions({ id, permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
    },
  });
};