import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../../service/project.service";
import { invalidateProjectQueries } from "./invalidateProjectQueries";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteTasks }: { id: string | number; deleteTasks?: boolean }) =>
      deleteProject({ id, deleteTasks }),
    onSuccess: (_data, variables) => {
      invalidateProjectQueries(queryClient, variables.id);
      queryClient.removeQueries({ queryKey: ["project", String(variables.id)] });
      queryClient.removeQueries({ queryKey: ["client-portal-project", String(variables.id)] });
    },
  });
};
