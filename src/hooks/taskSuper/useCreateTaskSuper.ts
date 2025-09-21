import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createTaskSuper } from "../../service/taskSuper.service";
import { message } from "antd";

export const useCreateTaskSuper = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createTaskSuper(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskSuper"] });
      message.success("Task Super created successfully");
      navigate("/task-template");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create Task Super";
      message.error(errorMessage);
    }
  });
};