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
      // navigate(`/project/${response.project}/tasks`);
    },
  });
};
