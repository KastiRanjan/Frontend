import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/service/task.service";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return deleteTask({ id });
    },
    onSuccess: (data, variables) => {
      // Invalidate multiple query keys to ensure all task-related data is refreshed
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project_task"] }); // This will match all project_task queries
      queryClient.invalidateQueries({ queryKey: ["project_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] }); // Invalidate our new query key
      
      // If we have project ID from the response, invalidate project-specific queries
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ["project_task", data.projectId] });
        queryClient.invalidateQueries({ queryKey: ["project_tasks", data.projectId] });
      }
      
      // Remove the specific task from cache if possible
      queryClient.removeQueries({ queryKey: ["task", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });
};
