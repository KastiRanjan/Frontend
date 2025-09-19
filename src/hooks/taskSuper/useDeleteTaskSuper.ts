import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskSuper } from "../../service/taskSuper.service";
import { message } from "antd";

export const useDeleteTaskSuper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return deleteTaskSuper({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskSuper"] });
      message.success("Task Super deleted successfully");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete Task Super";
      message.error(errorMessage);
    }
  });
};