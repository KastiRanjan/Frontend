import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editProject } from "../../service/project.service";
import { useNavigate } from "react-router-dom";

export const useEditProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editProject({ payload, id });
    },
    onSuccess: () => {
      // Invalidate all project-related queries to ensure fresh data everywhere
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      navigate("/projects");
    },
  });
};
