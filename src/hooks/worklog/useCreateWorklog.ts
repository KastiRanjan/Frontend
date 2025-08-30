import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorklog } from "../../service/worklog.service";

interface CreateWorklogPayload {
  projectId: string;
  taskId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status?: string;
}

export const useCreateWorklog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorklogPayload) => {
      return createWorklog(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worklog-all"] });
      queryClient.invalidateQueries({ queryKey: ["worklogs"] });
    },
  });
};
