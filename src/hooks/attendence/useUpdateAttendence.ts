import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAttendence } from "../../service/attendence.service";

export const useUpdateAttendence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, id }: { payload: any; id: string }) => {
      return updateAttendence({ payload, id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendence"] });
    },
  });
};