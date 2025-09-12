import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addTaskProjectIndividual } from "../../service/task.service";

export const useAddTaskProjectIndividual = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return addTaskProjectIndividual(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project_task"] }); // This will match all project_task queries
      queryClient.invalidateQueries({ queryKey: ["project_tasks", response.project] });
      // navigate(`/project/${response.project}/tasks`);
    },
  });
};
