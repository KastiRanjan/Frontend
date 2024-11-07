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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_task"] });
      navigate(-1);
    },
  });
};
