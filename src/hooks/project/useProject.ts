import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../service/project.service";

export const useProject = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      return fetchProjects({ page, limit });
    },
    // enabled: !!page && !!limit,
  });
};
