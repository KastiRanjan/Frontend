import { markTasksComplete } from "@/service/task.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMarkTasksComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => {
      console.log("Mark complete payload:", payload);
      return markTasksComplete(payload);
    },
    onSettled: () => {
      // Always invalidate queries after the mutation settles (success or error)
      queryClient.invalidateQueries({ queryKey: ["project_task"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] }); // Invalidate our new query key
    },
  });   
};