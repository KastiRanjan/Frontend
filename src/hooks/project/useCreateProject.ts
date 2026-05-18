import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../service/project.service";
import { useNavigate } from "react-router-dom";
import { invalidateProjectQueries } from "./invalidateProjectQueries";

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload) => {
      return createProject(payload);
    },
    onSuccess: (project: any) => {
      invalidateProjectQueries(queryClient, project?.id);
      navigate("/projects");
    },
  });
};
