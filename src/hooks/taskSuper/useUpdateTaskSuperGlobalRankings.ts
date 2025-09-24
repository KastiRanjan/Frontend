import { TaskSuperGlobalRankingPayload, updateTaskSuperGlobalRankings } from "@/service/taskSuperRanking.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useUpdateTaskSuperGlobalRankings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rankings: TaskSuperGlobalRankingPayload[]) => {
      return updateTaskSuperGlobalRankings(rankings);
    },
    onSuccess: () => {
      message.success("TaskSuper global rankings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["taskSuper"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update TaskSuper global rankings");
    },
  });
};
