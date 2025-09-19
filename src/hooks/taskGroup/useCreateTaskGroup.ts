import { createTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useCreateTaskGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: any) => {
      return createTaskGroup(payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate general taskGroup query
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
      
      // Invalidate specific taskGroups query for this taskSuperId
      if (variables.taskSuperId) {
        queryClient.invalidateQueries({ queryKey: ["taskGroups", variables.taskSuperId] });
      }
      
      // Navigate only if not coming from a specific TaskSuper detail page
      if (!variables.taskSuperId) {
        navigate("/task-template");
      }
    },
  });
};
