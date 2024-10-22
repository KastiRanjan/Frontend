import { editTaskGroup } from "@/service/taskgroup.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editTaskGroup({ payload, id });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] });
    },
  });
};
