import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editProject } from "../../service/project.service";
import { useNavigate } from "react-router-dom";
import { invalidateProjectQueries } from "./invalidateProjectQueries";

export const useEditProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ payload, id }: any) => {
      return editProject({ payload, id });
    },
    onSuccess: (project: any, variables: any) => {
      invalidateProjectQueries(queryClient, project?.id || variables?.id);
      navigate("/projects");
    },
  });
};
