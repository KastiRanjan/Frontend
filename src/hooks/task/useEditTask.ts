import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTask } from "@/service/task.service";

export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      console.log("payload:", payload); // Debug payload
      console.log("id:", id); // Debug id
      return updateTask({ payload, id });
    },
    onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ["project_task"] }); // This will match all project_task queries
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["current_user_tasks"] });
      // Invalidate project queries to refresh project details when tasks are updated
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // If we have project ID from the response, invalidate specific project
      if (data?.project?.id) {
        queryClient.invalidateQueries({ queryKey: ["project", data.project.id] });
      }
    },
  });
};
