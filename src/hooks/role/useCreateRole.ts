import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole } from "../../service/role.service";

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createRole(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
