import { fetchTaskSuperById } from "@/service/taskSuper.service";
import { useQuery } from "@tanstack/react-query";

export const useFetchTaskSuper = (id: string) => {
  return useQuery({
    queryKey: ["taskSuper", id],
    queryFn: () => fetchTaskSuperById({ id }),
    enabled: !!id,
    retry: false,
  });
};