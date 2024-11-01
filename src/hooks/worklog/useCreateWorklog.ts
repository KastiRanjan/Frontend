import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorklog } from "../../service/worklog.service";

export const useCreateWorklog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createWorklog(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["worklogs"] });
    },
  });
};
