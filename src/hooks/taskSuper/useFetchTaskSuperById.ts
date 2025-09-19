import { useQuery } from "@tanstack/react-query";
import { fetchTaskSuperById } from "../../service/taskSuper.service";

export const useFetchTaskSuperById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["taskSuper", id],
    queryFn: () => fetchTaskSuperById({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};