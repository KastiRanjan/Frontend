import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../service/task.service";
import { useNavigate } from "react-router-dom";

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createTask(payload);
    },
    onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ["project_task"] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["current_user_tasks"] });
      // Invalidate project queries to refresh project details when tasks are added
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // If we have project ID from the response, invalidate specific project
      if (data?.task?.project?.id) {
        queryClient.invalidateQueries({ queryKey: ["project", data.task.project.id] });
      }
      navigate(-1);
    },
  });
};
