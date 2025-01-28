import { fetchTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useTasks = ({ status }: { status: string }) => {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      return fetchTasks({ status });
    },
  });
};
