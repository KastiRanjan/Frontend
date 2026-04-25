import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkRejectWorklogs } from "@/service/worklog.service";

export const useBulkRejectWorklogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ worklogIds, rejectedRemark }: { worklogIds: string[]; rejectedRemark?: string }) =>
      bulkRejectWorklogs({ worklogIds, rejectedRemark }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklog-user"] });
      queryClient.invalidateQueries({ queryKey: ["worklog-admin-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklogs"] });
      queryClient.invalidateQueries({ queryKey: ["project-worklogs"] });
    },
  });
};