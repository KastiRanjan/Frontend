import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskSuper } from "../../service/taskSuper.service";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

export const useEditTaskSuper = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ payload, id }: { payload: any; id: string }) => {
      return editTaskSuper({ payload, id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskSuper"] });
      message.success("Task Super updated successfully");
      navigate("/tasksuper");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update Task Super";
      message.error(errorMessage);
    }
  });
};