import { createTaskTemplate } from "@/service/tasktemplate.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { message } from "antd";

export const useCreateTaskTemplate = () => {
  const {id}= useParams();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      return createTaskTemplate(payload);
    },
    onSuccess: () => {
      message.success("Task template created successfully");
      // Invalidate all task template and task group related queries
      queryClient.invalidateQueries({ queryKey: ["taskGroup", id] });
      queryClient.invalidateQueries({ queryKey: ["taskTemplate"] });
      queryClient.invalidateQueries({ queryKey: ["taskGroup"] }); // Invalidate all task groups
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to create task template";
      message.error(errorMessage);
    },
  });
};
