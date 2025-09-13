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
    onSuccess: () => {
      // Invalidate all project-related queries to ensure fresh data everywhere
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      navigate("/projects");
    },
  });
};
