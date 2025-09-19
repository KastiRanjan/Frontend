import { useQuery } from "@tanstack/react-query";
import { fetchProject } from "../../service/project.service";

export const useProjectById = ({ id }: { id: string | undefined }) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Project ID is required");
      }
      return fetchProject({ id });
    },
    enabled: !!id,
  });
};
