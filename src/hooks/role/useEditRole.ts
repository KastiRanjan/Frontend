import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editRole } from "../../service/role.service";

export const useEditRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({payload,id}:any) => {
      return editRole({payload,id});
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
