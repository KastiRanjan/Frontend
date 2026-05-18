import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../../service/project.service";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteTasks }: { id: string | number; deleteTasks?: boolean }) =>
      deleteProject({ id, deleteTasks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
};
