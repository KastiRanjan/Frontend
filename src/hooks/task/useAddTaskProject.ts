import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addTaskProject } from "../../service/task.service";

export const useAddTaskProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return addTaskProject(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project_task"] }); // This will match all project_task queries
      queryClient.invalidateQueries({ queryKey: ["project_tasks", response.project] });
      // Also invalidate individual project queries to refresh project detail pages
      queryClient.invalidateQueries({ queryKey: ["project", response.project?.toString()] });
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Refresh project list
      // navigate(`/project/${response.project}/tasks`);
    },
  });
};
