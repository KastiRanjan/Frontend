import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAttendence } from "../../service/attendence.service";
import { message } from "antd";

export const useCreateAttendence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload:any) => {
      console.log(payload);
      return createAttendence(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["attendence"] });
      queryClient.invalidateQueries({ queryKey: ["attendence-list"] });
      message.success(`Clock ${response.clockIn ? "Out" : "In"} Saved`);
    },
  });
};
