import { TaskRankingPayload, updateTaskRankings } from "@/service/taskranking.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

interface UpdateRankingsParams {
  projectId: string;
  rankings: TaskRankingPayload[];
}

export const useUpdateTaskRankings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, rankings }: UpdateRankingsParams) => {
      return updateTaskRankings(projectId, rankings);
    },
    onSuccess: (_, { projectId }) => {
      message.success("Task rankings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["taskRankings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update task rankings");
    },
  });
};