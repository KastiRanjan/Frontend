
import { useQuery } from "@tanstack/react-query";
import { fetchWorklogsByUser } from "../../service/worklog.service";

export const useWorklogbyUser = (status: string) => {
  return useQuery({
    queryKey: ["worklog-all", status],
    queryFn: async () => {
      return fetchWorklogsByUser(status);
    },
    enabled: !!status,
  });
};


