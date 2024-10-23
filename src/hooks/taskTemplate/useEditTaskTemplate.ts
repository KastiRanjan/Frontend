import { editTaskTemplate } from "@/service/tasktemplate.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useEditTaskTemplate = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editTaskTemplate({ payload, id });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["taskTemplate"] });

      navigate("/task-template");
    },
  });
};
