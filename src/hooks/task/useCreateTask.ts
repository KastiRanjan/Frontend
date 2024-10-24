import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../service/task.service";

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createTask(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
