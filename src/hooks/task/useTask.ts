import { fetchTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      return fetchTasks();
    },
  });
};
