import { fetchProjectTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useProjectTask = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["project_task", id],
    queryFn: async () => {
      return fetchProjectTasks({ id });
    },
    enabled: !!id,
  });
};
