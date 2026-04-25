import { useQuery } from "@tanstack/react-query";
import { fetchProjectWorklogs } from "@/service/worklog.service";

export const useProjectWorklogs = (projectId?: string) => {
  return useQuery({
    queryKey: ["project-worklogs", projectId],
    queryFn: () => fetchProjectWorklogs({ projectId: projectId! }),
    enabled: !!projectId,
  });
};