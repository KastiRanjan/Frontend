import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../service/project.service";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createProject(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
