import { TaskSuperRankingPayload, updateTaskSuperRankings } from "@/service/taskranking.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

interface UpdateTaskSuperRankingsParams {
  projectId: string;
  rankings: TaskSuperRankingPayload[];
}

export const useUpdateTaskSuperRankings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, rankings }: UpdateTaskSuperRankingsParams) => {
      return updateTaskSuperRankings(projectId, rankings);
    },
    onSuccess: (_, { projectId }) => {
      message.success("Task Super Project rankings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["taskRankings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update Task Super Project rankings");
    },
  });
};