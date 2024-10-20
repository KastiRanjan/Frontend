import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPermission } from "../service/permission.service";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createPermission(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};
