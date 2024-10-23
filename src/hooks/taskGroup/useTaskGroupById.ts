import { fetchTaskGroupById } from "@/service/taskgroup.service";
import { useQuery } from "@tanstack/react-query";

export const useTaskGroupById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["taskGroup", id],
    queryFn: async () => {
      return fetchTaskGroupById({ id });
    },
    enabled: !!id,
  });
};
