import { editTaskTemplate } from "@/service/tasktemplate.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const useEditTaskTemplate = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editTaskTemplate({ payload, id });
    },
    onSuccess: () => {
      // Invalidate all task template and task group related queries
      queryClient.invalidateQueries({ queryKey: ["taskGroup", id] });
      queryClient.invalidateQueries({ queryKey: ["taskTemplate"] });
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] }); // Invalidate all task groups
    },
  });
};
