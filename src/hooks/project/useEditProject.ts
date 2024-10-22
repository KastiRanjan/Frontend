import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editProject } from "../../service/project.service";

export const useEditProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({payload,id}:any) => {
      return editProject({payload,id});
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
