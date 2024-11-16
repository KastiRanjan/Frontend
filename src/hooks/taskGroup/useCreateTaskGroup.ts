import { createTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useCreateTaskGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createTaskGroup(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
      navigate("/task-template");
    },
  });
};
