import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../service/project.service";

export const useProject = ({status}: {status: string}) => {
  return useQuery({
    queryKey: ["projects", status],
    queryFn: async () => {
      return fetchProjects({status});
    },
    // enabled: !!page && !!limit,
  });
};
