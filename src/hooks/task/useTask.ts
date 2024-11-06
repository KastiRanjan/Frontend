import { fetchTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useTask = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      return fetchTasks();
    },
  });
};
