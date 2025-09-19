import { TaskGroupRankingPayload, updateTaskGroupRankings } from "@/service/taskranking.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

interface UpdateTaskGroupRankingsParams {
  projectId: string;
  rankings: TaskGroupRankingPayload[];
}

export const useUpdateTaskGroupRankings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, rankings }: UpdateTaskGroupRankingsParams) => {
      return updateTaskGroupRankings(projectId, rankings);
    },
    onSuccess: (_, { projectId }) => {
      message.success("Task Group Project rankings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["taskRankings", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Failed to update Task Group Project rankings");
    },
  });
};