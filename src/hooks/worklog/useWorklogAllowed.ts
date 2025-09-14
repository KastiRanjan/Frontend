import { useQuery } from "@tanstack/react-query";
import { checkWorklogAllowed } from "../../service/worklog.service";

export const useWorklogAllowed = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ["worklog-allowed", taskId],
    queryFn: () => checkWorklogAllowed({ taskId: taskId! }),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache for 5 minutes since project settings don't change often
  });
};