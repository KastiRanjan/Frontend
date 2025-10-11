import { fetchCurrentUserTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserTasks = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["current_user_tasks"],
    queryFn: async () => {
      return fetchCurrentUserTasks();
    },
    enabled,
  });
};
