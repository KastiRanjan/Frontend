import { fetchTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useProjectTask = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      return fetchTasks();
    },
  });
};
