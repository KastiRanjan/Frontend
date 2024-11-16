import { editTaskTemplate } from "@/service/tasktemplate.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editTaskTemplate({ payload, id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskTemplate"] });
    },
  });
};
