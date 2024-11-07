import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addTaskProject } from "../../service/task.service";

export const useAddTaskProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      console.log(payload);
      return addTaskProject(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      navigate(`/project/${response.project}/tasks`);
    },
  });
};
