import { fetchTaskGroup } from "@/service/taskgroup.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskGroup = () => {
  return useQuery({
    queryKey: ["taskGroup"],

    queryFn: async () => {
      return fetchTaskGroup();
    },
    // enabled: !!page && !!limit,
  });
};
