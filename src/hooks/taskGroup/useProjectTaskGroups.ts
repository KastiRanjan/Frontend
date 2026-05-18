import { fetchProjectTaskGroups } from "@/service/taskgroup.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch project-scoped task groups
 * These are the project instances that should be used for task group selections
 * when creating or editing tasks
 */
export const useProjectTaskGroups = (projectId?: string) => {
  return useQuery({
    queryKey: ["projectTaskGroups", projectId],
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      return fetchProjectTaskGroups(projectId);
    },
    enabled: !!projectId,
  });
};
