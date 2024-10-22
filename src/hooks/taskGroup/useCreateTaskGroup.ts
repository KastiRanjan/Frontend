import { createTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTaskGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createTaskGroup(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
    },
  });
};
