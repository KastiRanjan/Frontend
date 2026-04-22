import { completeAllProjectTasks } from "@/service/task.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCompleteAllProjectTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, taskIds }: { projectId: string; taskIds?: string[] }) =>
      completeAllProjectTasks(projectId, taskIds),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project_task"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["current_user_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
