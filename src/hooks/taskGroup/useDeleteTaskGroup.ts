import { deleteTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useDeleteTaskGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskGroup,
    onSuccess: () => {
      message.success("Task group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to delete task group");
    },
  });
};