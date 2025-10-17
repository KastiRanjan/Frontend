import { useMutation, useQueryClient } from "@tanstack/react-query";
import { firstVerifyTasks, secondVerifyTasks } from "@/service/task.service";

export const useFirstVerifyTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: firstVerifyTasks,
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["projectTasks"] });
  queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] }); // Invalidate our new query key
  queryClient.invalidateQueries({ queryKey: ["current_user_tasks"] });
    },
    onError: (error) => {
      console.error("First verify tasks error:", error);
    },
  });
};

export const useSecondVerifyTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: secondVerifyTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projectTasks"] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks-hierarchy"] }); // Invalidate our new query key
    },
    onError: (error) => {
      console.error("Second verify tasks error:", error);
    },
  });
};