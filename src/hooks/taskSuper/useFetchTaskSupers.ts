import { useQuery } from "@tanstack/react-query";
import { fetchTaskSuper } from "../../service/taskSuper.service";

export const useFetchTaskSupers = (params: any = {}) => {
  return useQuery({
    queryKey: ["taskSuper", params],
    queryFn: () => fetchTaskSuper(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};