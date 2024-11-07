import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editPermission } from "../../service/permission.service";

export const useEditPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({payload,id}:any) => {
      return editPermission({payload,id});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};
