import { editTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useEditTaskGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editTaskGroup({ payload, id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
      navigate("/task-template");
    },
  });
};
