import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../service/project.service";
import { useNavigate } from "react-router-dom";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createProject(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/project");
    },
  });
};
