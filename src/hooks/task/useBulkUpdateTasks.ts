import { bulkUpdateTasks } from "@/service/task.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload:any) => {
      console.log("Payload:", payload);
      return bulkUpdateTasks(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_task"] }); // This will match all project_task queries
    },
    onError: (error) => {
      console.error("Bulk update failed:", error);
    },
  });   
};