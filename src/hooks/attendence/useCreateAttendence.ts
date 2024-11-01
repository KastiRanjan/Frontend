import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAttendence } from "../../service/attendence.service";

export const useCreateAttendence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload:any) => {
      console.log(payload);
      return createAttendence(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["attendences"] });
    },
  });
};
