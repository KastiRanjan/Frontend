import { useQuery } from "@tanstack/react-query";
import { fetchProject } from "../../service/project.service";

export const useProjectById = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      return fetchProject({ id });
    },
    enabled: !!id,
  });
};
