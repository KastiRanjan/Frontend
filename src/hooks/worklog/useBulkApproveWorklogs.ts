import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkApproveWorklogs } from "@/service/worklog.service";

export const useBulkApproveWorklogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ worklogIds }: { worklogIds: string[] }) => bulkApproveWorklogs({ worklogIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
      queryClient.invalidateQueries({ queryKey: ["worklog-admin-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklogs"] });
      queryClient.invalidateQueries({ queryKey: ["project-worklogs"] });
    },
  });
};