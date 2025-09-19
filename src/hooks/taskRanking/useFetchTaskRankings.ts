import { fetchTaskRankings } from "@/service/taskranking.service";
import { useQuery } from "@tanstack/react-query";

export const useFetchTaskRankings = (projectId?: string) => {
  return useQuery({
    queryKey: ["taskRankings", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return fetchTaskRankings(projectId);
    },
    enabled: !!projectId,
  });
};