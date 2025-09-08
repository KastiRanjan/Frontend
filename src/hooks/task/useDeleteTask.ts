import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/service/task.service";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return deleteTask({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "project_task"] });
    },
  });
};
