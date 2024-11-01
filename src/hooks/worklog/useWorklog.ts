
import { useQuery } from "@tanstack/react-query";
import { fetchWorklogs } from "../../service/worklog.service";

export const useWorklog = () => {
  return useQuery({
    queryKey: ["worklog"],
    queryFn: async () => {
      return fetchWorklogs();
    },
    // enabled: !!page && !!limit,
  });
};
