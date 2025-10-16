import { fetchTaskGroup } from "@/service/taskgroup.service";
import { useQuery } from "@tanstack/react-query";

interface FetchTaskGroupsParams {
  taskSuperId?: string;
  limit?: number;
  page?: number;
}

export const useFetchTaskGroups = (params?: FetchTaskGroupsParams) => {
  return useQuery({
    queryKey: ["taskGroups", params?.taskSuperId, params?.limit, params?.page],
    queryFn: async () => {
      return fetchTaskGroup(params);
    },
  });
};