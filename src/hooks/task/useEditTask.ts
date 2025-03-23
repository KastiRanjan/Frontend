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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project","project_task"] });
    },
  });
};
