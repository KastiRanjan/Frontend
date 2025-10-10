import { fetchUserProjectTasks } from "@/service/task.service";
import { useQuery } from "@tanstack/react-query";

export const useUserProjectTasks = ({ 
  projectId, 
  userId 
}: { 
  projectId: string | undefined;
  userId: string | undefined;
}) => {
  return useQuery({
    queryKey: ["user_project_tasks", projectId, userId],
    queryFn: async () => {
      return fetchUserProjectTasks({ projectId, userId });
    },
    enabled: !!projectId && !!userId,
  });
};