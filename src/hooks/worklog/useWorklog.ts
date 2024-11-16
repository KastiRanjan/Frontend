
import { useQuery } from "@tanstack/react-query";
import { fetchWorklogs } from "../../service/worklog.service";

export const useWorklog = (status: string) => {
  return useQuery({
    queryKey: ["worklog-all", status],
    queryFn: async () => {
      return fetchWorklogs(status);
    },
    enabled: !!status,
  });
};
