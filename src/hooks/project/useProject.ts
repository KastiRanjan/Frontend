import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../service/project.service";

export const useProject = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return fetchProjects();
    },
    // enabled: !!page && !!limit,
  });
};
