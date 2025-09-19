import { fetchTaskGroup } from "@/service/taskgroup.service";
import { useQuery } from "@tanstack/react-query";

interface FetchTaskGroupsParams {
  taskSuperId?: string;
}

export const useFetchTaskGroups = (params?: FetchTaskGroupsParams) => {
  return useQuery({
    queryKey: ["taskGroups", params?.taskSuperId],
    queryFn: async () => {
      return fetchTaskGroup(params);
    },
  });
};