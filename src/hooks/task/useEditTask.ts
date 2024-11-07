import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTask } from "@/service/task.service";

export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return updateTask({ payload, id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_task"] });
    },
  });
};
